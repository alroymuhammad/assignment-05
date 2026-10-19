import {
  contains,
  gEval,
  runEvalCli,
  type EvalMetricArgs,
} from '@anvia/core/evals'
import { runAgent } from '../agent.js'
import { document } from '../context/document.js'
import { lens, lensEvalReporter } from '../lens.js'
import { DEFAULT_MODEL_ID, getModel } from '../models.js'

const judgeModel = getModel(DEFAULT_MODEL_ID)

// Each case carries the reference answer for the judge and the key number for the regex check.
type Expected = {
  answer: string
  numbers: RegExp
}

const expectedAnswer = ({ case: testCase }: EvalMetricArgs<string, string, Expected>) =>
  testCase.expected!.answer

const expectedNumbers = ({ case: testCase }: EvalMetricArgs<string, string, Expected>) =>
  testCase.expected!.numbers

// The judge can only verify "no unsupported claims" if it can read the same
// source document the agent was given.
const documentContext = () => [document.text]

await runEvalCli({
  name: 'majusel-support-policies',
  cases: [
    {
      id: 'email-response-target',
      input: 'Berapa lama target balasan email layanan pelanggan?',
      expected: {
        answer: 'Target balasan email layanan pelanggan adalah 1 hari kerja.',
        numbers: /1\s*hari\s*kerja/i,
      },
    },
    {
      id: 'transaction-review-target',
      input: 'Berapa lama target pemeriksaan keluhan transaksi atau tagihan?',
      expected: {
        answer: 'Pemeriksaan transaksi atau tagihan ditargetkan maksimal 3 hari kerja.',
        numbers: /3\s*hari\s*kerja/i,
      },
    },
    {
      id: 'major-outage-update',
      input: 'Seberapa sering pembaruan diberikan saat terjadi gangguan area?',
      expected: {
        answer: 'Pembaruan gangguan area diberikan minimal setiap 4 jam sampai layanan pulih.',
        numbers: /4\s*jam/i,
      },
    },
    {
      id: 'approved-refund-time',
      input: 'Jika pengembalian dana disetujui, berapa lama prosesnya?',
      expected: {
        answer:
          'Pengembalian dana yang disetujui diproses dalam 5–10 hari kerja, bergantung metode pembayaran.',
        numbers: /5\s*(?:[–—-]|sampai|hingga)\s*10\s*hari\s*kerja/i,
      },
    },
    {
      id: 'standard-verification-count',
      input: 'Berapa data yang perlu cocok untuk verifikasi standar pelanggan?',
      expected: {
        answer:
          'Verifikasi standar menggunakan dua data yang cocok dan tidak boleh meminta OTP, PIN, atau identitas lengkap melalui percakapan.',
        numbers: /(?:2|dua)\s+data/i,
      },
    },
  ],
  target: askAgent,
  metrics: createMetrics(),
  reporters: [lensEvalReporter],
  exitCode: true,
}).finally(() => lens.close())

async function askAgent(input: string): Promise<string> {
  const stream = runAgent({ messages: [{ role: 'user', content: input }] })
  let answer = ''
  for await (const text of stream.textStream) answer += text
  return answer
}

function createMetrics() {
  return [
    gEval<
      string,
      string,
      Expected,
      'correctness',
      readonly ['input', 'actualOutput', 'expectedOutput', 'context'],
      typeof expectedAnswer,
      typeof documentContext
    >({
      name: 'correctness',
      model: judgeModel,
      evaluationParams: ['input', 'actualOutput', 'expectedOutput', 'context'],
      context: documentContext,
      criteria:
        'Nilai apakah jawaban menjawab pertanyaan kebijakan layanan dengan benar dan aman. expectedOutput adalah fakta minimum yang wajib ada, bukan daftar lengkap fakta yang boleh disebut. Terima detail tambahan dari context (misalnya target waktu, langkah verifikasi, aturan privasi, dan kanal resmi) selama detail itu ada di context atau konsisten dengannya. Kurangi skor hanya jika fakta inti salah atau hilang, jawaban bertentangan dengan context, meminta data sensitif seperti OTP/PIN/identitas lengkap, atau menjanjikan hasil yang tidak dijamin kebijakan.',
      rubric: [
        { scoreRange: [0, 2], expectedOutcome: 'Fakta inti salah atau hilang, bertentangan dengan context, atau melanggar privasi.' },
        { scoreRange: [3, 5], expectedOutcome: 'Fakta inti benar tetapi ambigu, memuat klaim tambahan yang tidak didukung context, atau memberi janji yang tidak dijamin kebijakan.' },
        { scoreRange: [6, 8], expectedOutcome: 'Fakta inti benar dan semua klaim didukung context, tetapi penyajian kurang jelas atau kurang lengkap.' },
        { scoreRange: [9, 10], expectedOutcome: 'Fakta inti benar, semua detail tambahan didukung context, aman, jelas, dan langsung.' },
      ],
      threshold: 0.8,
      retries: 2,
      expected: expectedAnswer,
    }),
    // answerRelevancy scores per statement (relevant statements / all
    // statements), so greetings, caveats, and closing offers are treated as
    // irrelevant. A judge-level check measures whether the question was
    // answered without punishing helpful extra context.
    gEval<string, string, Expected, 'relevance', readonly ['input', 'actualOutput']>({
      name: 'relevance',
      model: judgeModel,
      evaluationParams: ['input', 'actualOutput'],
      criteria:
        'Nilai apakah jawaban menjawab pertanyaan pelanggan. Fokus pada apakah fakta yang diminta benar-benar dijawab, bukan pada panjang atau ringkasnya jawaban. Sapaan, detail tambahan yang relevan, dan tawaran bantuan tidak boleh menurunkan skor.',
      rubric: [
        { scoreRange: [0, 2], expectedOutcome: 'Jawaban tidak menjawab pertanyaan atau membahas topik lain.' },
        { scoreRange: [3, 5], expectedOutcome: 'Jawaban hanya menjawab sebagian atau ambigu.' },
        { scoreRange: [6, 8], expectedOutcome: 'Jawaban menjawab pertanyaan, tetapi ada bagian yang tidak perlu atau membingungkan.' },
        { scoreRange: [9, 10], expectedOutcome: 'Jawaban langsung, jelas, dan relevan; detail tambahan tetap mendukung jawaban.' },
      ],
      threshold: 0.7,
      retries: 2,
    }),
    contains({ expected: expectedNumbers }),
  ] as const
}

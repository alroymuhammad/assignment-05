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
  name: 'majusel-billing',
  cases: [
    {
      id: 'billing-cycle-end',
      input: 'Tanggal berapa siklus tagihan MajuPrime berakhir?',
      expected: {
        answer: 'Siklus tagihan MajuPrime berakhir tanggal 20.',
        numbers: /tanggal\s*20\b/i,
      },
    },
    {
      id: 'bill-issued',
      input: 'Kapan tagihan MajuPrime diterbitkan?',
      expected: {
        answer: 'Tagihan MajuPrime diterbitkan tanggal 21.',
        numbers: /tanggal\s*21\b/i,
      },
    },
    {
      id: 'bill-due-date',
      input: 'Kapan jatuh tempo tagihan MajuPrime?',
      expected: {
        answer: 'Tagihan MajuPrime jatuh tempo tanggal 5 bulan berikutnya.',
        numbers: /tanggal\s*5\b/i,
      },
    },
    {
      id: 'late-payment-restriction',
      input:
        'Setelah berapa lama layanan keluar MajuPrime dapat dibatasi karena tagihan belum dibayar?',
      expected: {
        answer: 'Layanan keluar dapat dibatasi 7 hari setelah jatuh tempo.',
        numbers: /7\s*hari/i,
      },
    },
    {
      id: 'service-restoration',
      input: 'Berapa lama target pembukaan pembatasan setelah pembayaran MajuPrime terverifikasi?',
      expected: {
        answer:
          'Pembukaan pembatasan ditargetkan maksimal 2 jam setelah pembayaran terverifikasi.',
        numbers: /2\s*jam/i,
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
        'Nilai apakah jawaban menjawab pertanyaan siklus dan tagihan dengan benar. expectedOutput adalah fakta minimum yang wajib ada, bukan daftar lengkap fakta yang boleh disebut. Terima detail tambahan dari context (misalnya tanggal siklus, penerbitan, jatuh tempo, pembatasan layanan, target pemulihan, dan kanal pembayaran) selama detail itu ada di context atau konsisten dengannya. Kurangi skor hanya jika fakta inti salah atau hilang, jawaban bertentangan dengan context, atau memuat klaim yang tidak ada di context.',
      rubric: [
        { scoreRange: [0, 2], expectedOutcome: 'Fakta inti salah, hilang, atau bertentangan dengan context.' },
        { scoreRange: [3, 5], expectedOutcome: 'Fakta inti benar tetapi ambigu, atau memuat klaim tambahan yang tidak didukung atau bertentangan dengan context.' },
        { scoreRange: [6, 8], expectedOutcome: 'Fakta inti benar dan semua klaim didukung context, tetapi penyajian kurang jelas atau kurang lengkap.' },
        { scoreRange: [9, 10], expectedOutcome: 'Fakta inti benar, semua detail tambahan didukung context, serta jelas dan langsung.' },
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

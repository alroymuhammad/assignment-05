import type { Document } from "@anvia/core";

export const document: Document = {
    id: "maju-telco-data-package-catalog",
    text: `# Katalog Paket Data Maju-Telco

## Paket data

| Paket | Kuota data | Masa aktif | Harga |
| --- | ---: | ---: | ---: |
| Maju Hemat 5 | 5 GB nasional | 7 hari | Rp18.000 |
| Maju Bulanan 25 | 25 GB nasional | 30 hari | Rp65.000 |
| Maju Bulanan 60 | 60 GB nasional | 30 hari | Rp110.000 |

## Ketentuan paket

- Harga pada tabel sudah termasuk pajak.
- Kuota hanya berupa kuota data nasional.
- Kuota dapat digunakan pada jaringan 4G atau 5G jika perangkat dan area mendukung.
- Paket tidak diperpanjang otomatis.
- Sisa kuota tidak terakumulasi dan akan hangus ketika masa aktif paket berakhir.
- Informasi diskon, promosi, bonus, metode pembelian, dan ketersediaan tidak disediakan.
`,
    additionalProps: { version: "5", language: "id-ID", product: "Maju-Telco" },
};

# Licenças de terceiros

O arquivo `src/dados/dicionarios.ts` contém listas derivadas dos pacotes abaixo, usadas pelo
Analisador para reconhecer senhas, palavras e nomes comuns. A lista curada de senhas brasileiras
intercalada no topo de `SENHAS_COMUNS` é própria do Aegis.

| Lista | Origem | Licença |
|---|---|---|
| `SENHAS_COMUNS` | `@zxcvbn-ts/language-common` 4.1.3 (`passwords`) | MIT |
| `PALAVRAS_PORTUGUES` | `@zxcvbn-ts/language-pt-br` 4.1.1 (`commonWords`) | MIT, com dados ODC-BY |
| `PALAVRAS_INGLES` | `@zxcvbn-ts/language-en` 4.1.1 (`commonWords`) | MIT, com dados ODC-BY |
| `NOMES` | `@zxcvbn-ts/language-pt-br` 4.1.1 e `@zxcvbn-ts/language-en` 4.1.1 (`firstnames`, `lastnames`) | MIT |

## zxcvbn-ts (MIT)

```
Copyright (c) 2012-2016 Dan Wheeler and Dropbox, Inc.
Copyright (c) 2021 @zxcvbn-ts

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

## OpenSubtitles via OPUS (ODC-BY)

Aviso mantido dos pacotes `@zxcvbn-ts/language-pt-br` e `@zxcvbn-ts/language-en`:

```
This package includes data derived from OpenSubtitles via OPUS in commonWords.json
(https://opus.nlpl.eu/).

Source dataset: OpenSubtitles 2024
Provider: Helsinki-NLP / OPUS

License: ODC-BY (Open Data Commons Attribution License)

Original data is attributed to subtitle contributors and rights holders.
This package contains a processed derivative:
- tokenized text
- frequency aggregation
- normalization and filtering

Any redistribution of this package must retain this notice.
```

No Aegis, a derivação acrescenta: remoção de acentos, só letras de a a z, palavras de 2 a 16 letras
e corte nas mais frequentes.

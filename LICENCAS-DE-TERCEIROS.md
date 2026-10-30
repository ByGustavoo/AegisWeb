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

## Impressão de credenciais

O PDF da tela Imprimir é montado no navegador pelo jsPDF, com as fontes Geist e Geist Mono embutidas
no arquivo. As fontes estáticas em `src/assets/fontes/` (`Geist-Regular`, `Geist-Medium`,
`Geist-SemiBold` e `GeistMono-Medium`, em TTF) foram copiadas sem alteração do pacote `geist` 1.8.2;
a interface usa as versões variáveis de `@fontsource-variable/geist` e `@fontsource-variable/geist-mono`,
da mesma família e sob a mesma licença.

| Pacote | Uso | Licença |
|---|---|---|
| `jspdf` 4.2.1 | Geração do PDF | MIT |
| `fflate` 0.8.3, `fast-png` 6.4.0, `@babel/runtime` 7.29.10 | Dependências do jsPDF | MIT |
| `html2canvas` 1.4.1, `canvg` 3.0.11, `dompurify` 3.4.17, `core-js` 3.51.0 | Dependências opcionais do jsPDF; entram no build em arquivos separados, mas o Aegis nunca os carrega | MIT; `dompurify` sob MPL-2.0 ou Apache-2.0 |
| Geist e Geist Mono | Fontes da interface e do PDF | SIL Open Font License 1.1 |

## jsPDF (MIT)

```
Copyright
(c) 2010-2025 James Hall, https://github.com/MrRio/jsPDF
(c) 2015-2025 yWorks GmbH, https://www.yworks.com/

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

## Geist e Geist Mono (SIL Open Font License 1.1)

```
Copyright (c) 2023 Vercel, in collaboration with basement.studio

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL

-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION AND CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
```

# Cálculo do observatório solar

O painel em `/solar` usa a localização autorizada do dispositivo. Antes da autorização e em erro, os valores ficam vazios. Uma cidade predefinida aparece apenas no formulário manual; nunca é apresentada como localização detectada.

- `suncalc@2.1.4`: elevação aparente em graus e azimute horário a partir do norte. Datas são instantes UTC, exibidos com o fuso da localização. A API desta versão usa graus; não aplicar as conversões da versão 1.
- `tz-lookup@6.1.25`: converte coordenadas em fuso sem chamadas de rede. A base é comprimida e pode aproximar fronteiras; o formulário permite corrigir o fuso manualmente.
- O instante vem do relógio do dispositivo, atualizado a cada segundo. A precisão física depende da coordenada, do relógio, do modelo astronômico, da atmosfera e de obstáculos reais. A leitura não é um sensor óptico do Sol.
- Nascer e pôr consideram horizonte livre, altura zero. Nas regiões polares eventos ausentes são nulos; o próximo evento é procurado por até 370 dias.
- O dia segue o calendário e fuso da localização, incluindo dias de 23/25 horas em transições de horário de verão. Duração de luz é a soma dos intervalos iluminados desse dia civil.
- A trajetória usa 97 amostras reais de elevação no dia civil. O marcador usa a posição calculada do instante atual, incluindo valores abaixo do horizonte à noite. Não é uma senoide decorativa.
- Coordenadas ficam somente na memória da página; o aplicativo não as envia a servidores nem as armazena. O navegador pode utilizar seu próprio provedor para obter a localização.

## Fontes e validação

API e convenções: [SunCalc](https://github.com/mourner/suncalc). A fixture independente de Fortaleza em 10/11/2026, UTC−3, foi consultada na [API do USNO](https://aa.usno.navy.mil/api/rstt/oneday?date=2026-11-10&coords=-3.7319,-38.5267&tz=-3): nascer 05:10, trânsito 11:18, pôr 17:26 (valores arredondados ao minuto). Testes aceitam diferença inferior a 60 segundos. [Condições atmosféricas](https://gml.noaa.gov/grad/solcalc/calcdetails.html) podem alterar o horário observado.

Testes cobrem virada do dia em UTC diferente do dia local, passagem pelo nascer, noite/dia polar, dias curtos/longos de DST, fuso pelas coordenadas, dados inválidos e orientação do azimute. A cobertura visual/funcional do navegador é documentada em `validacao.md`.

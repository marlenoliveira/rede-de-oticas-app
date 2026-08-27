# App da Vendedora — Rede de Óticas

Telas do app que as vendedoras usam para registrar atendimentos e treinar
o conteúdo dos manuais.

**Este repositório contém apenas a interface.** Não há aqui:

- nenhum código de acesso
- nenhum nome de pessoa
- nenhum dado de loja, atendimento ou indicador
- nenhuma regra de permissão
- nenhum conteúdo dos manuais

Tudo isso vive no servidor (Google Apps Script) e só é entregue depois
que um código de acesso válido é conferido **no servidor**. A página não
decide nada: ela desenha a tela e faz a pergunta.

O endereço do servidor está no código e não é segredo — qualquer chamada
sem um código válido é recusada.

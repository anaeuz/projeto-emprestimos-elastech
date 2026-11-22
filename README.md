# Sistema de Empréstimo de Equipamentos

API REST em Spring Boot (Java 25, Spring Data JPA, H2) para controlar o empréstimo de equipamentos (notebooks, monitores, headsets) para as pessoas colaboradoras.

- **API no Render:** https://projeto-emprestimos-elastech.onrender.com
- **Repositório:** https://github.com/anaeuz/projeto-emprestimos-elastech

## Como rodar

1. Ter o Java 25 instalado.
2. Abrir o projeto no IntelliJ e rodar a classe `EmprestimosApplication` (botão ▶), ou no terminal:
   ```bash
   mvn spring-boot:run
   ```
3. A API sobe em `http://localhost:8080`.
4. Console do banco: `http://localhost:8080/h2-console` (JDBC URL `jdbc:h2:file:./dados/emprestimos`, usuário vazio, senha vazia).

Para rodar os testes: botão direito em `src/test/java` → Run 'All Tests', ou `mvn test`.

## Rotas

### Equipamentos

| Método | Rota | O que faz | Sucesso |
|---|---|---|---|
| GET | `/equipamentos` | Lista (filtros opcionais `?tipo=NOTEBOOK` e `?disponivel=true/false`) | 200 |
| GET | `/equipamentos/{id}` | Busca um equipamento | 200 |
| POST | `/equipamentos` | Cadastra | 201 |
| PUT | `/equipamentos/{id}` | Atualiza nome e tipo | 200 |
| DELETE | `/equipamentos/{id}` | Remove (se nunca foi emprestado) | 204 |

### Colaboradores

| Método | Rota | O que faz | Sucesso |
|---|---|---|---|
| POST | `/colaboradores` | Cadastra | 201 |
| GET | `/colaboradores` | Lista | 200 |
| GET | `/colaboradores/{id}` | Busca uma pessoa | 200 |
| GET | `/colaboradores/{id}/emprestimos` | Histórico de empréstimos da pessoa | 200 |

### Empréstimos

| Método | Rota | O que faz | Sucesso |
|---|---|---|---|
| POST | `/emprestimos?equipamentoId=1&colaboradorId=2` | Empresta | 201 |
| GET | `/emprestimos` | Lista todos (`?atrasados=true` traz só os atrasados) | 200 |
| GET | `/emprestimos/{id}` | Busca um empréstimo | 200 |
| PUT | `/emprestimos/{id}/devolucao` | Registra a devolução | 200 |

## Regras de negócio

| Regra | Descrição |
|---|---|
| R1 | Não existem dois equipamentos com o mesmo patrimônio |
| R2 | Todo equipamento novo nasce disponível |
| R3 | Não existem duas pessoas com o mesmo e-mail |
| R4 | Só se empresta equipamento disponível |
| R5 | Ao emprestar, o equipamento fica indisponível e a devolução prevista é daqui a 14 dias |
| R6 | Um empréstimo já devolvido não pode ser devolvido de novo |
| R7 | Ao devolver, a data de devolução é hoje e o equipamento volta a ficar disponível |
| R8 | Atrasado = não devolvido e com a data prevista já passada (calculado na hora) |
| R9 | Equipamento que já teve empréstimo não pode ser removido |
| R10 | Quem está com empréstimo atrasado não pode pegar outro equipamento |

## Bônus feitos

- Nenhum (só o obrigatório).

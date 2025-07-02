Based on the `GEMINI.md` file, the following conventions should be followed:

- **Immutability:** Favor immutable objects over mutable ones.
- **No Getters/Setters:** Avoid getters and setters.
- **Single Responsibility:** Classes should have a single primary constructor and encapsulate no more than four attributes.
- **CQRS:** Method names must respect the CQRS principle (nouns for queries, verbs for commands).
- **Testing:**
  - Every change must be covered by a unit test.
  - Each test case may contain only one assertion.
  - Tests must use irregular inputs and random values.
  - Mocks should be avoided in favor of fakes and stubs.
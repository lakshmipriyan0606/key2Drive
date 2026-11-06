# Deep Dive: The GSD Methodology

## Why Context Rot Occurs
When an LLM agent engages in a conversation spanning 20+ turns with dozens of tool outputs, code diffs, and terminal logs, the attention mechanism suffers from:
1. **Middle Loss**: Critical initial requirements are diluted by intermediate terminal outputs.
2. **Instruction Drift**: Subtle constraints (e.g. "do not change pricing model", "keep existing tests passing") get overridden by local completion heuristics.
3. **Repeated Mistake Loops**: If a test fails twice, the model tends to retry similar broken solutions rather than stepping back.

## How GSD Solves Context Rot
1. **File-First External Memory**: Important specs, task lists, and notes live in files (`PRD.md`, `STATE.md`), not ephemeral context messages.
2. **Wave Isolation**: Each wave focuses on a tight scope. If needed, a subagent can be invoked with a pristine context, executing only that wave.
3. **Deterministic Verification Gates**: A wave is never signed off without passing verifiable code assertions.


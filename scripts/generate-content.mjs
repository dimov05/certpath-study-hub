import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(root, 'content', 'source');
const targetDir = path.join(root, 'content', 'certificates', 'claude-architect-foundations');

const clean = (value) => value.replace(/\s{2,}$/u, '').trim();

async function buildQuestions() {
  const markdown = await readFile(path.join(sourceDir, 'CCA_Foundations_60Q_Mock_Exam.md'), 'utf8');
  const questionsBlock = markdown.split('## Questions')[1].split('## Answer sheet')[0];
  const answersBlock = markdown.split('## Answer key and explanations')[1].split('## Scoring worksheet')[0];
  const questions = [];
  let domainId = 'd1';
  let current = null;

  for (const line of questionsBlock.split('\n')) {
    const domainMatch = line.match(/^### Domain (\d)/u);
    if (domainMatch) {
      domainId = `d${domainMatch[1]}`;
      continue;
    }

    const questionMatch = line.match(/^\*\*(\d+)\.(?: Select (TWO|THREE)\.)?\*\*\s+(.+)$/u);
    if (questionMatch) {
      current = {
        id: `cca-f-q-${questionMatch[1]}`,
        number: Number(questionMatch[1]),
        domainId,
        prompt: clean(questionMatch[3]),
        select: questionMatch[2] === 'THREE' ? 3 : questionMatch[2] === 'TWO' ? 2 : 1,
        options: [],
        answer: [],
        explanation: '',
      };
      questions.push(current);
      continue;
    }

    const optionMatch = line.match(/^([A-E])\.\s+(.+)$/u);
    if (optionMatch && current) {
      current.options.push({ id: optionMatch[1], text: clean(optionMatch[2]) });
    }
  }

  const answers = new Map();
  for (const line of answersBlock.split('\n')) {
    const answerMatch = line.match(/^(\d+)\. \*\*([A-E](?:, [A-E])*)\.\*\*\s+(.+)$/u);
    if (answerMatch) {
      answers.set(Number(answerMatch[1]), {
        answer: answerMatch[2].split(', '),
        explanation: clean(answerMatch[3]),
      });
    }
  }

  for (const question of questions) Object.assign(question, answers.get(question.number));
  if (questions.length !== 60 || questions.some((question) => !question.answer.length)) {
    throw new Error(`Expected 60 complete questions; parsed ${questions.length}`);
  }
  return questions;
}

async function buildFlashcards() {
  const tsv = await readFile(path.join(sourceDir, 'CCA_Foundations_Flashcards.tsv'), 'utf8');
  return tsv
    .trim()
    .split('\n')
    .slice(1)
    .map((line, index) => {
      const [front, back, domain] = line.split('\t');
      return { id: `cca-f-card-${index + 1}`, front, back, domain };
    });
}

await mkdir(targetDir, { recursive: true });
await writeFile(path.join(targetDir, 'questions.json'), `${JSON.stringify(await buildQuestions(), null, 2)}\n`);
await writeFile(path.join(targetDir, 'flashcards.json'), `${JSON.stringify(await buildFlashcards(), null, 2)}\n`);

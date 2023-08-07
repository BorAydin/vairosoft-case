const APIURL = 'https://opentdb.com/api.php?amount=10&type=multiple';
const quiz = document.getElementById('quiz');
const answerEls = document.querySelectorAll('.answer');

const nextBtn = document.getElementById('nextBtn');
const label = document.getElementById('lbl');
const startBtn = document.getElementById('startBtn');
const startPage = document.getElementById('container');

let seriliazedQuestions = [];

const userObj = {
  results: [],
  username: '',
  totalScore: 0,
};

let currentQuiz = 0;

async function startApp() {
  addLabelAnimation();
  // initiliaze data
  const questions = await getQuizApi();
  seriliazedQuestions = seriliazeQuestionData(questions);

  renderCard(seriliazedQuestions);
}

function seriliazeQuestionData(data) {
  return data.results.map((item) => {
    const { incorrect_answers, correct_answer, question } = item;

    const suffledAnswers = suffleQuestionMarks([
      ...incorrect_answers,
      correct_answer,
    ]);

    return {
      question,
      A: suffledAnswers[0],
      B: suffledAnswers[1],
      C: suffledAnswers[2],
      D: suffledAnswers[3],
      correct: correct_answer,
    };
  });
}

// dom manipulation

startBtn.addEventListener('click', (e) => {
  const username = document.getElementById('username');

  e.preventDefault();
  if (username.value !== '') {
    quiz.style.display = 'block';
    startPage.style.display = 'none';
    userObj.username = username.value;

    const lastTotalScore = getTotalScoreByUser(username.value);
    if (lastTotalScore) {
      const div = document.createElement('div');
      div.className = 'result';
      div.appendChild(
        document.createTextNode(`En son puanınız: ${lastTotalScore}`)
      );
      quiz.appendChild(div);
    }
  } else return alert('Lütfen kullanıcı adı giriniz.');
});

nextBtn.addEventListener('click', () => {
  const user_answer = getSelected();

  const { correct, question } = seriliazedQuestions[currentQuiz];

  if (!user_answer) return alert('Lütfen soruyu cevaplayınız');

  if (user_answer === correct) {
    userObj.totalScore += 10;
  }

  userObj.results.push({
    question,
    user_answer,
  });

  currentQuiz++;

  if (currentQuiz < seriliazedQuestions.length) {
    renderCard(seriliazedQuestions);
  } else {
    quiz.innerHTML = addFinalResultContainer(
      seriliazedQuestions.length,
      userObj.totalScore
    );
    saveDataStorage(userObj);
  }
});

function renderCard(quizData) {
  deselectAnswers();
  const questionEl = document.getElementById('question'),
    a_text = document.getElementById('a_text'),
    b_text = document.getElementById('b_text'),
    c_text = document.getElementById('c_text'),
    d_text = document.getElementById('d_text'),
    a = document.getElementById('a'),
    b = document.getElementById('b'),
    c = document.getElementById('c'),
    d = document.getElementById('d');

  const currentQuizData = quizData[currentQuiz];

  questionEl.innerText = currentQuizData.question;
  a_text.innerText = currentQuizData.A;
  b_text.innerText = currentQuizData.B;
  c_text.innerText = currentQuizData.C;
  d_text.innerText = currentQuizData.D;
  a.value = currentQuizData.A;
  b.value = currentQuizData.B;
  c.value = currentQuizData.C;
  d.value = currentQuizData.D;
}

function addFinalResultContainer(questionLength, totalScore) {
  return `
 <h2>Doğru cevaplanan soru sayısı ${totalScore / 10}/${questionLength}</h2> 
 <h2>Toplam puan: ${totalScore}</h2> 
 <button onclick="location.reload()">Yenile</button>
 `;
}

// request actions

async function getQuizApi() {
  const response = await fetch(APIURL);
  return await response.json();
}

// utils

function saveDataStorage(data) {
  if (data)
    localStorage.setItem(
      'user_question_record_' + data.username,
      JSON.stringify(data)
    );
  else alert('data bulunamadı.');
}

function getTotalScoreByUser(username) {
  const userData = JSON.parse(
    localStorage.getItem('user_question_record_' + username) || {}
  );

  if (userData.username === username) return userData?.totalScore;
}

function suffleQuestionMarks(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * i);
    let k = array[i];
    array[i] = array[j];
    array[j] = k;
  }

  return array;
}

function getSelected() {
  let answer;

  answerEls.forEach((answerEl) => {
    if (answerEl.checked) {
      answer = answerEl.value;
    }
  });

  return answer;
}

function deselectAnswers() {
  answerEls.forEach((answerEl) => (answerEl.checked = false));
}

function addLabelAnimation() {
  label.innerHTML = label.innerText
    .split('')
    .map(
      (letter, idx) =>
        `<span style="transition-delay:${idx * 50}ms">${letter}</span>`
    )
    .join('');
}

startApp();

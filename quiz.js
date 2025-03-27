const API_URL = "https://opentdb.com/api.php?amount=10&type=multiple";

const initQuiz = document.getElementById("selectQuiz");
const quizButton = document.getElementById("buttonQuiz");
quizButton.addEventListener("click", getQuiz);
const reloadQuiz = document.getElementById("resetQuiz");
reloadQuiz.addEventListener("click", () => quizReload());

const nextQ = document.getElementById("buttonNext");
nextQ.addEventListener("click", () => nextQuestion());
const showResults = document.getElementById("buttonResults");


let quiz;
function getQuiz(){
    fetch(API_URL)
    .then((response) => response.json())
    .then((data) => {        
        quiz = data.results;

        initQuiz.style.display = "none";
        nextQ.style.display = "inline";

        showQuestion(quiz);
    })

    .catch((error) => {
        console.error("Error en la solicitud:", error);
    });
}

const showQ = document.getElementById("boxQuestions");
const showR = document.getElementById("boxResult");

let numQuestion = 0;

async function showQuestion(quiz){
    nextQ.setAttribute("disabled", "true");

    const arrayAnswers = [];
    arrayAnswers.push(quiz[numQuestion].correct_answer);
    quiz[numQuestion].incorrect_answers.forEach(incorrectAns => {
        arrayAnswers.push(incorrectAns);
    });

    await shuffleAnswers(arrayAnswers);

    let boxAnswers = "";
    arrayAnswers.forEach(answer => {
        boxAnswers += `
        <section class="singleAnswer">
            <input type="radio" name="question${numQuestion}" id="${answer}" onclick="saveAnswer(event, numQuestion)"/>
            <label for="questionChoice${arrayAnswers.indexOf(answer)}">${answer}</label>
        </section>
        `
    });

    showQ.innerHTML = 
    `<article class="singleQuestion" id="${numQuestion}">
        <h2>Pregunta ${numQuestion+1}</h2>
        <section class="quizAnswersSection">
            <form>
                <fieldset>
                <legend>${quiz[numQuestion].question}</legend>
                <section class="selectAnswers">
                   ${boxAnswers}
                </section>
                </fieldset>
            </form>
        </section>
    </article>
    `;
}

function shuffleAnswers(arrayAnswers){
    //* Algoritmo de FIsher-Yates.

    for (let i = arrayAnswers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrayAnswers[i], arrayAnswers[j]] = [arrayAnswers[j], arrayAnswers[i]];
    }

    return arrayAnswers;
}

let finalAnswers = [];
function saveAnswer(event, idAnswer) {
    nextQ.removeAttribute("disabled");

    const answerQuestion = event.target.id;

    if (numQuestion == quiz.length - 1){
        nextQ.style.display = "none";
        showResults.style.display = "inline";
    }

    if (finalAnswers.length == 0){
        finalAnswers.push(answerQuestion);
    }
    else{
        finalAnswers[idAnswer] = answerQuestion;
    }
}


function nextQuestion(){
    numQuestion++;    
    showQuestion(quiz);
}

function checkResults(quiz, finalAnswers){
    let green = 0;
    let red = 0;

    finalAnswers.forEach(answer => {
        if (answer == quiz[finalAnswers.indexOf(answer)].correct_answer){
            green++
        }
        else{
            red++
        }
    });

    showQ.style.display = "none";
    buildChart(green, red);
}

showResults.addEventListener("click", () => checkResults(quiz, finalAnswers));

function buildChart(hits, misses){
    showR.innerHTML = " <canvas id='miGrafico'></canvas>";
    const ctx = document.getElementById('miGrafico').getContext('2d');

    const datos = {
        labels: ['Aciertos', 'Fallos',],
        datasets: [{
            label: 'Resultados',
            data: [hits, misses],
            backgroundColor: ['green', 'red'],
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        },
        ]
    };
    
    const miGrafico = new Chart(ctx, {
        type: 'pie', // Tipo de gráfico: 'bar', 'line', 'pie', etc.
        data: datos,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            animation: {
                duration: 1000, // Duración en milisegundos
                easing: 'easeOutBounce' // Tipo de animación
            }
        }
    });

    initQuiz.style.display = "inline";
    quizButton.style.display = "none";
    reloadQuiz.style.display = "inline";
    showR.style.display = "inline";
}

function quizReload(){
    location.reload();
}
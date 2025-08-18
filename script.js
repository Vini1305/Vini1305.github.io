let currentPage = 1;
let dataset = "";
let datasets = {
  cumprimento: [
    "Bom dia!", 
    "Espero que você tenha um ótimo dia!",
    "Que seu dia comece cheio de motivação!",
    "Olá! Que seja um dia produtivo!",
    "Aproveite cada momento de hoje!",
    "Desejo que seu dia seja leve e cheio de conquistas!",
    "Que hoje você encontre alegria nas pequenas coisas!",
    "Bom dia! Que sua energia contagie todos ao redor!",
    "Que seu dia seja repleto de boas surpresas!",
    "Olá! Tenha um dia maravilhoso e cheio de inspiração!"
  ],
  piadas: [
    "Por que o computador foi ao médico? Porque estava com um vírus!",
    "Qual o cúmulo do matemático? Ter problemas demais!",
    "O que o zero disse para o oito? Belo cinto!",
    "Por que o livro de matemática se suicidou? Porque tinha muitos problemas.",
    "Qual é o cúmulo do eletricista? Não ter luz própria.",
    "O que o peixe falou para o outro? Nada, nada!",
    "Por que o computador não consegue pegar frio? Porque tem Windows!",
    "Qual é o cúmulo do pintor? Ficar sem pincel no quadro.",
    "Por que a banana foi ao médico? Porque não estava descascando bem.",
    "O que o tomate disse para o outro? Não se esprema demais!"
  ],
  perguntas: [
    "A capital do Brasil é Brasília.",
    "Leonardo da Vinci pintou a Mona Lisa.",
    "A água ferve a 100°C ao nível do mar.",
    "O sol é a estrela mais próxima da Terra.",
    "A Segunda Guerra Mundial terminou em 1945.",
    "O elemento químico H é Hidrogênio.",
    "O maior planeta do sistema solar é Júpiter.",
    "O corpo humano tem 206 ossos.",
    "A velocidade da luz é aproximadamente 299.792 km/s.",
    "O monte mais alto do mundo é o Everest."
  ]
};


function nextPage() { 
    document.getElementById("page" + currentPage).classList.add("hidden"); 
    currentPage++; 
    document.getElementById("page" + currentPage).classList.remove("hidden"); }

function chooseDataset(choice) {
    dataset = choice;
    document.getElementById("chosenDataset").innerHTML = `<p><strong>Dataset escolhido:</strong> ${choice}</p>`;
    }

function generateTokens() {
  if (!dataset) return;

  // texto do dataset
  let text = datasets[dataset].join(" ");
  document.getElementById("originalText").innerText = text;

  // dividir em tokens
  let tokens = text.split(" ");

  // limpar áreas
  let tokensArea = document.getElementById("tokensArea");
  tokensArea.innerHTML = "";
  let idsArea = document.getElementById("tokenIds");
  idsArea.classList.add("hidden");

  // criar elementos dos tokens
  tokens.forEach((t, i) => {
    let span = document.createElement("span");
    span.className = "token";
    span.style.background = `hsl(${i*40},70%,40%)`;
    span.textContent = t;
    tokensArea.appendChild(span);

    // animação: mostrar 1 token a cada 200ms
    setTimeout(() => {
      span.classList.add("show");
    }, i * 200);
  });

  // depois de todos os tokens aparecerem, mostrar IDs
  setTimeout(() => {
    let tokenIds = tokens.map((t, i) => `${t} → ${100+i}`);
    idsArea.innerText = tokenIds.join(" | ");
    idsArea.classList.remove("hidden");
  }, tokens.length * 200 + 500);
}



function startTraining() {
  const bar = document.getElementById("trainingBar");
  const canvas = document.getElementById("weightsCanvas");
  const ctx = canvas.getContext("2d");

  const lossCanvas = document.getElementById("lossChart");
  const lossCtx = lossCanvas.getContext("2d");

  let progress = 0;
  let lossData = [];

  // posições dos neurônios
  const neurons = [];
  const layers = document.querySelectorAll("#network > div");
  layers.forEach(layer => {
    const layerNeurons = [];
    layer.querySelectorAll(".neuron").forEach(n => {
      const rect = n.getBoundingClientRect();
      const parentRect = canvas.getBoundingClientRect();
      layerNeurons.push({x: rect.left - parentRect.left + rect.width/2, y: rect.top - parentRect.top + rect.height/2});
    });
    neurons.push(layerNeurons);
  });

  // criar tokens animados (uma bolinha por token)
  const tokens = datasets[dataset] ? datasets[dataset].join(" ").split(" ") : ["Token1","Token2"];
  const tokenElems = tokens.map((t,i) => {
    const div = document.createElement("div");
    div.className = "tokenAnim";
    div.style.left = neurons[0][i % neurons[0].length].x + "px";
    div.style.top = neurons[0][i % neurons[0].length].y + "px";
    canvas.parentElement.appendChild(div);
    return {el: div, layer:0, neuron:i % neurons[0].length};
  });

  const interval = setInterval(() => {
    if(progress >= 100) { clearInterval(interval); return; }

    progress += 2;
    bar.style.width = progress + "%";

    // desenhar linhas de pesos
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let l=0; l<neurons.length-1; l++) {
      for(let i=0;i<neurons[l].length;i++) {
        for(let j=0;j<neurons[l+1].length;j++) {
          const w = 1 + Math.random()*progress/10;
          ctx.strokeStyle = `hsl(${progress*1.2},70%,50%)`;
          ctx.lineWidth = w;
          ctx.beginPath();
          ctx.moveTo(neurons[l][i].x, neurons[l][i].y);
          ctx.lineTo(neurons[l+1][j].x, neurons[l+1][j].y);
          ctx.stroke();
        }
      }
    }

    // atualizar loss
    lossData.push(100 - progress + Math.random()*5);
    lossCtx.clearRect(0,0,lossCanvas.width,lossCanvas.height);
    lossCtx.beginPath();
    lossCtx.strokeStyle = "#c77dff";
    lossCtx.lineWidth = 2;
    lossData.forEach((val,i)=>{
      const x = i*(lossCanvas.width/lossData.length);
      const y = lossCanvas.height - (val/100)*lossCanvas.height;
      if(i===0) lossCtx.moveTo(x,y);
      else lossCtx.lineTo(x,y);
    });
    lossCtx.stroke();

    // mover tokens pelas camadas
    tokenElems.forEach(t => {
      if(t.layer < neurons.length-1) {
        const target = neurons[t.layer+1][t.neuron % neurons[t.layer+1].length];
        let dx = (target.x - parseFloat(t.el.style.left)) * 0.05;
        let dy = (target.y - parseFloat(t.el.style.top)) * 0.05;
        t.el.style.left = parseFloat(t.el.style.left) + dx + "px";
        t.el.style.top = parseFloat(t.el.style.top) + dy + "px";
        if(Math.abs(target.x - parseFloat(t.el.style.left))<2 && Math.abs(target.y - parseFloat(t.el.style.top))<2) {
          t.layer++;
        }
      }
    });

  }, 200);
}

// respostas predefinidas para cada dataset
const llmResponses = {
  cumprimento: [
    { question: "Como você me cumprimenta hoje?", answer: "Bom dia! Que seu dia seja incrível e cheio de energia positiva." },
    { question: "Me diga uma mensagem positiva.", answer: "Espero que você tenha um ótimo dia, cheio de sorrisos!" },
    { question: "Que mensagem motivadora você tem para mim?", answer: "Que seu dia comece cheio de motivação e boas energias!" },
    { question: "Como começar o dia com energia?", answer: "Olá! Que seja um dia produtivo e feliz." },
    { question: "Me envie um cumprimento animado!", answer: "Bom dia! Aproveite cada momento de hoje." },
    { question: "Qual é a saudação perfeita para hoje?", answer: "Desejo que seu dia seja leve e cheio de conquistas." },
    { question: "Me deseje um bom dia de forma especial.", answer: "Que hoje você encontre alegria nas pequenas coisas." },
    { question: "Que frase positiva você me daria agora?", answer: "Bom dia! Que sua energia contagie todos ao redor." },
    { question: "Como me inspirar neste dia?", answer: "Que seu dia seja repleto de boas surpresas!" },
    { question: "Me dê um incentivo para começar o dia bem.", answer: "Olá! Tenha um dia maravilhoso e cheio de inspiração." }
  ],
  piadas: [
    { question: "Conte uma piada engraçada.", answer: "Por que o computador foi ao médico? Porque estava com um vírus!" },
    { question: "Me faça rir!", answer: "Qual o cúmulo do matemático? Ter problemas demais!" },
    { question: "Qual é a piada do dia?", answer: "O que o zero disse para o oito? Belo cinto!" },
    { question: "Me conte algo divertido.", answer: "Por que o livro de matemática se suicidou? Porque tinha muitos problemas." },
    { question: "Faça-me sorrir com uma piada.", answer: "Qual é o cúmulo do eletricista? Não ter luz própria." },
    { question: "Você conhece alguma piada de computador?", answer: "O que o peixe falou para o outro? Nada, nada!" },
    { question: "Qual é a piada mais engraçada que você sabe?", answer: "Por que o computador não consegue pegar frio? Porque tem Windows!" },
    { question: "Me conte um trocadilho divertido.", answer: "Qual é o cúmulo do pintor? Ficar sem pincel no quadro." },
    { question: "Faça uma piada rápida para mim.", answer: "Por que a banana foi ao médico? Porque não estava descascando bem." },
    { question: "Pode me contar uma piada leve e engraçada?", answer: "O que o tomate disse para o outro? Não se esprema demais!" }
  ],
  perguntas: [
    { question: "Qual é a capital do Brasil?", answer: "A capital do Brasil é Brasília." },
    { question: "Quem pintou a Mona Lisa?", answer: "Leonardo da Vinci pintou a Mona Lisa." },
    { question: "A que temperatura a água ferve ao nível do mar?", answer: "A água ferve a 100°C ao nível do mar." },
    { question: "Qual é a estrela mais próxima da Terra?", answer: "O sol é a estrela mais próxima da Terra." },
    { question: "Quando terminou a Segunda Guerra Mundial?", answer: "A Segunda Guerra Mundial terminou em 1945." },
    { question: "Qual é o elemento químico H?", answer: "O elemento químico H é Hidrogênio." },
    { question: "Qual é o maior planeta do sistema solar?", answer: "O maior planeta do sistema solar é Júpiter." },
    { question: "Quantos ossos tem o corpo humano?", answer: "O corpo humano tem 206 ossos." },
    { question: "Qual é a velocidade da luz?", answer: "A velocidade da luz é aproximadamente 299.792 km/s." },
    { question: "Qual é o monte mais alto do mundo?", answer: "O monte mais alto do mundo é o Everest." }
  ]
};



function simulateLLMInteraction() {
  if (!dataset) return;

  const chatArea = document.getElementById("chatArea");
  const tokenProbArea = document.getElementById("tokenProbabilities");

  // Simula uma pergunta predefinida do usuário
  const userQuestions = {
  cumprimento: [
    "Como você me cumprimenta hoje?",
    "Me diga uma mensagem positiva.",
    "Que mensagem motivadora você tem para mim?",
    "Como começar o dia com energia?",
    "Me envie um cumprimento animado!",
    "Qual é a saudação perfeita para hoje?",
    "Me deseje um bom dia de forma especial.",
    "Que frase positiva você me daria agora?",
    "Como me inspirar neste dia?",
    "Me dê um incentivo para começar o dia bem."
  ],
  piadas: [
    "Conte uma piada engraçada.",
    "Me faça rir!",
    "Qual é a piada do dia?",
    "Me conte algo divertido.",
    "Faça-me sorrir com uma piada.",
    "Você conhece alguma piada de computador?",
    "Qual é a piada mais engraçada que você sabe?",
    "Me conte um trocadilho divertido.",
    "Faça uma piada rápida para mim.",
    "Pode me contar uma piada leve e engraçada?"
  ],
  perguntas: [
    "Me diga um fato interessante.",
    "Responda uma pergunta de conhecimento geral.",
    "Qual é uma curiosidade sobre o mundo?",
    "Me conte algo sobre ciência.",
    "Qual é um dado histórico interessante?",
    "Diga algo que poucas pessoas sabem.",
    "Me dê uma informação educativa.",
    "Qual é um fato curioso sobre o planeta Terra?",
    "Compartilhe um conhecimento geral.",
    "Me diga algo para aprender hoje."
  ]
};


    // Seleciona aleatoriamente um item do dataset escolhido
    const responses = llmResponses[dataset];
    const item = responses[Math.floor(Math.random() * responses.length)];

    // Adicionar pergunta do usuário no chat (agora usa a pergunta do item)
    const userQ = item.question;
    const userDiv = document.createElement("div");
    userDiv.className = "chat-message chat-user";
    userDiv.innerText = userQ;
    chatArea.appendChild(userDiv);

    // Escolher resposta do LLM (resposta correspondente à pergunta)
    const llmResp = item.answer;

  // Mostrar resposta LLM no chat
  const llmDiv = document.createElement("div");
  llmDiv.className = "chat-message chat-llm";
  llmDiv.innerText = llmResp;
  chatArea.appendChild(llmDiv);

  chatArea.scrollTop = chatArea.scrollHeight;

  // Mostrar probabilidades dos tokens
  const tokens = llmResp.split(" ");
  const probs = tokens.map(t => (Math.random()*0.5+0.5).toFixed(2)); // 0.5 a 1.0

  tokenProbArea.innerHTML = "";
  tokens.forEach((t,i)=>{
    const span = document.createElement("span");
    span.className = "token-prob";
    span.style.background = `hsl(${probs[i]*120},70%,40%)`;
    span.innerText = `${t} (${probs[i]})`;
    tokenProbArea.appendChild(span);
  });
}
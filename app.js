    const siteURL='http://localhost/continentquiz/';
    const questionsPerQuiz=5, bestScoresQuant=3, nrChoices=3;
    const viewIds=['home','main','results'];
    const buttonIds=['playBtn','ans0Btn','ans1Btn','ans2Btn','nextBtn','homeBtn','playAgainBtn'];
    let onClickListeners={};
    let viewDivs={};
    let btns={};
    let ansbtns=[];
    let img;
    let curQuestionData;
    let pts=0, ptsQuant=750;
    let answers;
    let qGen;
    let curQuestionNmbr=1;
    let localStorage=window.localStorage;
    let scoreboardTbl;
    let qa;//images and answer cache array// load json only once!

    window.onload= function(){
        getViewDivs();//stavlja divove (koji su kao template) u viewDivs...
        img=document.getElementById('questionImg');
        scoreboardTbl=document.getElementById('scoreboardTbl');
        injectScoreboardTbl(localStorage,scoreboardTbl);//postavlja scoreboard niz u tabelu..
        switchToView(viewDivs[viewIds[0]]);//samo jedan div se postavlja kao vidljiv, u ovom slucaju prvi, tj home div
        addClickListeners(buttonIds,btns);
        getAnswerButtons(btns);//stavlja answer buttons iz btns u niz ansbtns
    }

    function getViewDivs(){
        for(i of viewIds) viewDivs[i]=document.getElementById(i);
    }

    function injectScoreboardTbl(localStorage,scoreboardTbl){
        let bs=getBestScores(localStorage);
        if (Array.isArray(bs) && bs.length){
            let scoreboard="";
            for(i of bs) scoreboard+="<tr>"+i+"</tr>";
            scoreboardTbl.innerHTML=scoreboard;
        }
    }

    function switchToView(newView, viewData=null){//mislio sam da preko viewData saljem podatke za view... ali sam odustao od toga obrisacu to...
        for(i of Object.values(viewDivs)) setVisibility(i,false);
        setVisibility(newView,true);
    }

    function addClickListeners(buttonIds,btns){
        for(i of buttonIds){
            btns[i]=document.getElementById(i);
            btns[i].addEventListener('click', functionDispatcher(onClickListeners,i)); 
        }
    }

    function allAnswersClickable(yes=true){
        for(i of ansbtns) i.disabled=!yes;
    }

    function answersGetFeedback(pressedAns,correctAns,allAns){
        pressedAns.classList.remove('text-only');
        if (pressedAns.childNodes[0].innerText==correctAns){
            pressedAns.classList.add('pressed','correct');
            pts+=ptsQuant;
            return;
        }
        pressedAns.classList.add('pressed', 'incorrect');
        for(i of allAns){
            if (i.childNodes[0].innerText==correctAns){
                i.classList.remove('text-only');
                i.classList.add('correct');
            }
        }
    }

    function allAnswersTextOnly(allAns){
        for(i of allAns){
            i.classList.remove('pressed','incorrect','correct');
            i.classList.add('text-only');
        }
    }

    function functionDispatcher(functions,key){
        // console.log(key.slice(3,4));
        if (key.slice(0,3)=='ans'){//regex umesto ovoga
            return functions['ansBtn'];
        }
        else if(key.slice(0,4)=='play'){
            return functions['playBtn']
        }
        return functions[key];
    }

    onClickListeners.ansBtn = function(evt){
        allAnswersClickable(false);
        answersGetFeedback(evt.currentTarget,curQuestionData.qa.continent, ansbtns, pts, ptsQuant);
        setVisibility(nextBtn);
    }
    onClickListeners.playBtn=function(){
        startNewQuiz();
    }
    onClickListeners.nextBtn=function(){
        if (curQuestionNmbr>=questionsPerQuiz) {
            saveScore(localStorage,pts);
            document.getElementById('scoreP').innerText=pts;//prebaci u varijable
            switchToView(viewDivs.results);
            return;
        }
        curQuestionNmbr++;
        if (curQuestionNmbr>=questionsPerQuiz) {
            btns.nextBtn.innerText='Go to Results';
        }
        curQuestionData=qGen.next().value;
        viewNextQuestion(curQuestionData);
    }
    onClickListeners.homeBtn=function(){
        injectScoreboardTbl(localStorage,scoreboardTbl);
        switchToView(viewDivs.home);
    }

    //error handling
    function fetchJSONFile(path, callback) { //uradi ovo tako da vraca podatke koje mogu da stavim u const
        let httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function() {
            if (httpRequest.readyState === 4) {
                if (httpRequest.status === 200) {
                    console.log('getting json');
                    let data = JSON.parse(httpRequest.responseText);
                    if (callback) callback(data);
                }
                else{
                    console.log('status',httpRequest.status)
                }
            }
            else{
                console.log('readystate', httpRequest.readyState)
            }
        };
        httpRequest.open('GET', path);
        httpRequest.send();
    }

    function startNewQuiz(){
        // setVisibility(img,false);
        img.classList.remove('load');
        curQuestionNmbr=1;
        pts=0;
        btns.nextBtn.innerText='Next Question';
        fetchJSONFile(siteURL+'answers.json',onAnswersRecieved);
    }

    function getBestScores(localStorage){
       return JSON.parse(localStorage.getItem('bestScores'));
    }

    function setBestScores(localStorage,bs){
        localStorage.setItem('bestScores',JSON.stringify(bs))
    }

    function getScorePos(bs,score){
        for(let i=0;i<bs.length;i++) if (parseInt(bs[i])<score) return i;
        return bs.length;
    }

    function saveScore(localStorage,score){
        bs=getBestScores(localStorage,score);
        if (Array.isArray(bs) && bs.length){
            scorePos=getScorePos(bs,score);
            if (scorePos>bestScoresQuant-1) return;
            bs.splice(scorePos,0,score).splice(bestScoresQuant);
            setBestScores(localStorage,bs);
        }
        else setBestScores(localStorage,[score]);
    }

    function setVisibility(element,visible=true){
        if (visible){
            element.classList.remove('invisible');
            return;
        }
        element.classList.add('invisible');
    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getDistinctValues(answers,varName='continent'){ 
        let distinct={};
        distinct=new Set(answers.map(x=>x[varName]));
        return distinct;
    }

    function getRandomElement(set){
        arr=Array.from(set.keys());
        let ri=getRandomInt(0,arr.length-1);
        return arr[ri];
    }

    function shuffleArray(a) {
        let j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;//remove return?
    }

    function* getQuestionData(answers, distinct, nrChoices=3, answerVarName='continent'){
        while(true){
            let available=new Set(distinct),qd={};
            qd.choices=[];
            qd.qa=answers.splice(getRandomInt(0,answers.length-1),1)[0];
            qd.choices.push(qd.qa[answerVarName]);
            available.delete(qd.qa[answerVarName]);
            for(let i=1;i<nrChoices-1;i++){
                qd.choices.push(getRandomElement(available));
                available.delete(qd.choices[qd.choices.length-1]);
            }
            qd.choices.push(getRandomElement(available));
            shuffleArray(qd.choices);
            yield qd
        }
    }

    function getAnswerButtons(btns){
        for (let i=0;i<nrChoices;i++) ansbtns[i]=btns['ans'+i+'Btn'];
    }

    function viewNextQuestion(qd){
        img.classList.remove('load');
        img.src=qd.qa.image;
        document.getElementById('questionNmbr').innerText=curQuestionNmbr;
        for(i=0;i<ansbtns.length;i++) ansbtns[i].childNodes[0].innerText=qd.choices[i];
        console.log('allAnsTextOnly');
        allAnswersTextOnly(ansbtns);
        allAnswersClickable(true);
        setVisibility(btns.nextBtn,false);
        switchToView(viewDivs.main);
    }

    function onImgLoaded(){
        // setVisibility(img,true);
        img.classList.add('load');
        // console.log("IMG LOADED");
    }

    function onAnswersRecieved(data){
        answers=data;
        const distinct=getDistinctValues(answers);
        qGen=getQuestionData(answers,distinct,3);
        curQuestionData=qGen.next().value;
        viewNextQuestion(curQuestionData);
    }//local store the current question?
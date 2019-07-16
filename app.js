//home view:
    // display top 3 user scores and play button:
        // from local storage load json with top three users and scores
        // view the data
        // listen for play button press
        //on press transfer to mainscreen

//main screen:
    //display question nmbr, picture and answers:
        //done:    //load question json
                //take one question/answer pair //randomly //done
                //add two more different answers  //randomly //done
        //local store the current question!!! current state! cause reload
        //view the data
        //listen for answer button press
        //check if answer is correct
        //add points
        //give feedback
        //loop this for 5 questions //dont repeat the same

//results screen
    //display points, play again, scoreboard button
    //write points to local storage

//distinct modules:
    // from local storage load json with top three users and scores
    // view the data //send data to view
    // listen for clicks
    // transfer to other views/scripts
    // distinct view patterns //like questions, scoreboard and end quiz score

    const siteURL='http://localhost/continentquiz/';

    const viewIds=['home','main','results'];
    const buttonIds=['playBtn','ans0Btn','ans1Btn','ans2Btn','nextBtn','homeBtn','playAgainBtn'];
    let onClickListeners={};
    let viewDivs={};
    let btns={};
    let ansbtns={};
    let img;
    let curQuestionData;
    let pts=0, ptssQuant=750;
    let answers;
    let qGen;
    let curQuestionNmbr=1;
    const questionsPerQuiz=5, bestScoresQuant=3;
    let localStorage=window.localStorage;
    let scoreboardTbl;

    window.onload= function(){
        getViewDivs();
        img=document.getElementById('questionImg');
        scoreboardTbl=document.getElementById('scoreboardTbl');
        injectScoreboardTbl(localStorage,scoreboardTbl);
        switchToView(viewDivs[viewIds[0]]);
        addClickListeners(buttonIds,btns);
    }

    function getViewDivs(){
        for(i of viewIds){
            viewDivs[i]=document.getElementById(i);
        }
    }

    function injectScoreboardTbl(localStorage,scoreboardTbl){
        let bs=getBestScores(localStorage);
        if (Array.isArray(bs) && bs.length){
            let scoreboard="";
            for(i of bs){
                scoreboard+="<tr>"+i+"</tr>";
            }
            scoreboardTbl.innerHTML=scoreboard;
        }
    }

    function switchToView(newView, viewData=null){
        for(i of Object.values(viewDivs)){
            setVisibility(i,false);
        }
        setVisibility(newView,true);
    }

    function addClickListeners(buttonIds,btns){
        for(i of buttonIds){
            btns[i]=document.getElementById(i);
            btns[i].addEventListener('click', functionDispatcher(onClickListeners,i)); 
        }
    }

    function disableAllAnswers(){
        btns.ans0Btn.disabled=false;
        btns.ans1Btn.disabled=false;
        btns.ans2Btn.disabled=false;
    }

    function functionDispatcher(functions,key){
        return functions[key];
    }

    onClickListeners.playBtn=function(){
        startNewQuiz();
    }
    onClickListeners.ans0Btn=function(){
        btns.ans0Btn.disabled=true;
        btns.ans1Btn.disabled=true;
        btns.ans2Btn.disabled=true;
        let correct=btns.ans0Btn.innerText==curQuestionData.qa.continent?true:false;
        pts+=correct?ptssQuant:0;
        window.alert('You are '+(correct?'right! :)':'wrong. :(')+'\npoints:'+pts);
        setVisibility(nextBtn);
    }
    onClickListeners.ans1Btn=function(){
        btns.ans0Btn.disabled=true;
        btns.ans1Btn.disabled=true;
        btns.ans2Btn.disabled=true;
        let correct=btns.ans1Btn.innerText==curQuestionData.qa.continent?true:false;
        pts+=correct?ptssQuant:0;
        window.alert('You are '+(correct?'right! :)':'wrong. :(')+"\n"+'points:'+pts);
        setVisibility(nextBtn);
    }
    onClickListeners.ans2Btn=function(){
        btns.ans0Btn.disabled=true;
        btns.ans1Btn.disabled=true;
        btns.ans2Btn.disabled=true;
        let correct=btns.ans2Btn.innerText==curQuestionData.qa.continent?true:false;
        pts+=correct?ptssQuant:0;
        window.alert('You are '+(correct?'right! :)':'wrong. :(')+"\n"+'points:'+pts);
        setVisibility(nextBtn);
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
        switchToView(viewDivs['home']);
    }
    onClickListeners.playAgainBtn=function(){
        startNewQuiz();
    }

    //error handling
    function fetchJSONFile(path, callback) {
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
            bs.splice(scorePos,0,score);
            bs.splice(bestScoresQuant);
            setBestScores(localStorage,bs);
        }
        else{
            setBestScores(localStorage,[score]);
        }
    }

    function setVisibility(element,visible=true){
        element.style.display=visible?'block':'none';
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

    function viewNextQuestion(qd){
        img.src=qd.qa.image;
        for (let i=0;i<qd.choices.length;i++){  
            btns['ans'+i+'Btn'].innerText=qd.choices[i];
        }
        btns.ans0Btn.disabled=false;
        btns.ans1Btn.disabled=false;
        btns.ans2Btn.disabled=false;
        setVisibility(btns.nextBtn,false);
        switchToView(viewDivs['main']);
    }

    function onAnswersRecieved(data){
        console.log('answers',data.length);
        answers=data;
        const distinct=getDistinctValues(answers);
        qGen=getQuestionData(answers,distinct,3);
        curQuestionData=qGen.next().value;
        viewNextQuestion(curQuestionData);
    }//local store the current question?
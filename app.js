    //zadaci: 1. keep the button style on clicked
            //2. write/save the name of those who have top3 score
            //3. style all the views
            //4. improve architecture/ make new architecture
            //5. responsive design css grid?
            //6. code checkup and cleaning
            //7. disable all things in view before fade out, but without losing their style
                //and enable them when they are fadeing in
            //8. img resize kako treba
            //9. json filtering and validation
            //10. HTML i js validacija...
            //11. scss .partial
            //12. stilizacija slova
    //priority: 12. 8. 3. 5. 4. 11. 9. 10. 6.
    //done 2. 7. 1.

    const siteURL='http://192.168.1.3/continentquiz/';
    const questionsPerQuiz=5, bestScoresQuant=3, nrChoices=3;
    const viewIds=['home','main','results'];
    const buttonIds=['playBtn','ans0Btn','ans1Btn','ans2Btn','nextBtn', 'homeBtn','playAgainBtn','saveScoreBtn'];
    let distinct;
    let onClickListeners={};
    let viewDivs={};
    let btns={};
    let ansbtns=[];
    let img;
    let curQuestionData;
    let pts=0, ptsQuant=750;
    let constanswers=null,answers=null;
    let qGen;
    let curQuestionNmbr=1;
    let localStorage=window.localStorage;
    let scoreboardDiv;
    let nextImg;
    let nextQuestionData;
    let gspd;
    //odraditi neki feedback kad se slika jos nije ucitala, ili ne dopustiti sled pitanje dok se ne ucita...

    window.onload= function(){
        fetchJSONFile(siteURL+'answers.json',onAnswersRecieved);
        getViewDivs();//stavlja divove (koji su kao template) u viewDivs...
        img=document.getElementById('questionImg');
        scoreboardDiv=document.getElementById('scoreboardDiv');
        injectScoreboardTbl(localStorage,scoreboardDiv);//postavlja scoreboard niz u tabelu..
        switchToView(viewDivs[viewIds[0]]);//samo jedan div se postavlja kao vidljiv, u ovom slucaju prvi, tj home div
        addClickListeners(buttonIds,btns);
        getAnswerButtons(btns);//stavlja answer buttons iz btns u niz ansbtns
        prepNewQuiz().Rsesult;
        console.log('done');
    }

    function getViewDivs(){
        for(i of viewIds) viewDivs[i]=document.getElementById(i);
    }

    function createElement(tag,innerText=''){
        let element=document.createElement(tag);
        element.innerText=innerText;
        return element;
    }

    function injectScoreboardTbl(localStorage,scoreboardDiv){
        let bs=getBestScores(localStorage);
        if (Array.isArray(bs) && bs.length){
            let scoreboard=document.createElement('table');
            let thead=scoreboard.appendChild(document.createElement('thead'));
            let headtr=thead.appendChild(document.createElement('tr'));
            headtr.appendChild(createElement('th','Rank'));
            headtr.appendChild(createElement('th','Username'));
            headtr.appendChild(createElement('th','Score'));
            let tbody=scoreboard.appendChild(document.createElement('tbody'));
            let tr,tdU,tdS;
            for(let i=0;i<bs.length;i++){ 
                tr=createElement('tr');
                tdR=createElement('td','#'+(i+1));
                tdU=createElement('td',bs[i].username);
                tdS=createElement('td',bs[i].score);
                tr.appendChild(tdR);
                tr.appendChild(tdU);
                tr.appendChild(tdS);
                tbody.appendChild(tr);
            }
            scoreboard.appendChild(tbody);
            scoreboardDiv.replaceChild(scoreboard,scoreboardDiv.childNodes[0]);
        }
    }

    function switchToView(newView, viewData=null){//mislio sam da preko viewData saljem podatke za view... ali sam odustao od toga obrisacu to...
        for(i of Object.values(viewDivs)) if (!i.classList.contains('dsp-none')) setFade(i,false);
        setFade(newView,true);
    }

    function addClickListeners(buttonIds,btns){
        for(i of buttonIds){
            btns[i]=document.getElementById(i);
            btns[i].addEventListener('click', functionDispatcher(onClickListeners,i)); 
        }
    }

    function allAnswersClickable(yes=true){
        for(i of ansbtns) i.classList[yes?'remove':'add']('disabled');
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
        viewDivs.main.classList.remove('fade-in');
        allAnswersClickable(false);
        answersGetFeedback(evt.currentTarget,curQuestionData.qa.continent, ansbtns, pts, ptsQuant);
        setFade(btns.nextBtn);
        btns.nextBtn.focus();
    }
    onClickListeners.playBtn=function(evt){
        viewDivs.home.classList.remove('fade-in');
        viewDivs.results.classList.remove('fade-in');
        // evt.currentTarget.classList.add('pressed');
        startNewQuiz();
    }
    onClickListeners.nextBtn=function(evt){
        // evt.currentTarget.classList.add('pressed');
        let cln=viewDivs.main.cloneNode(true);
        cln.style.position='absolute';
        cln.id='cln';
        cln.querySelector('#nextBtn').classList.remove('fade-in');
        document.body.appendChild(cln);
        setDisplayNone(btns.nextBtn);
        setFade(cln,false);
        viewDivs.main.classList.remove('fade-in');
        if (curQuestionNmbr>=questionsPerQuiz) {
            document.getElementById('scoreP').childNodes[0].innerText=pts;//prebaci u varijable
            prepNewQuiz();//za slucaj da se posle igra
            showResultsView(localStorage, pts);
            // switchToView(viewDivs.results);
            return;
        }
        curQuestionNmbr++;
        if (curQuestionNmbr>=questionsPerQuiz) {
            btns.nextBtn.innerText='Results';
        }
        // curQuestionData=qGen.next().value;//

        // setDisplayNone(cln,false,false);
        viewNextQuestion(nextQuestionData,nextImg);
    }
    onClickListeners.homeBtn=function(evt){
        // evt.currentTarget.classList.add('pressed');
        viewDivs.results.classList.remove('fade-in');
        injectScoreboardTbl(localStorage,scoreboardDiv);
        switchToView(viewDivs.home);
    }
    onClickListeners.saveScoreBtn=function(evt){
        // console.log('saveScrBtn');
        // evt.currentTarget.classList.add('pressed');
        username= evt.currentTarget.parentNode.querySelector('#usernameTxt').value;
        saveScore(localStorage,gspd,username);
        setFade(evt.currentTarget.parentNode,false);
    }

    function showResultsView(localStorage,score){
        gspd=getScorePos(localStorage, score);
        // console.log(gspd);
        if (gspd.save===true){
            setFade(document.getElementById('top3score'));
        }
        switchToView(viewDivs.results);
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

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }      

    async function prepNewQuiz(){
        // console.log('anss',answers);
        while(!(Array.isArray(constanswers) && constanswers.length)){//alternativa ovom najgorem cekanju
            console.log('anss',answers);
            await sleep(200);
        }
        answers=constanswers.slice();
        console.log('anss',answers);
        qGen=getQuestionData(answers,distinct,nrChoices);
        img=document.getElementById('questionImg');
        prepNewQuestion(qGen,img);
    }

    function startNewQuiz(){
        // setFade(img,false);
        // qGen=getQuestionData(answers,distinct,nrChoices);
        // nextImg=null;
        // nextQuestionData=null;
        console.log('anss2',answers);
        while(!(Array.isArray(answers) && answers.length)){//alternativa ovom najgorem cekanju
            console.log('anss2',answers);
            sleep(200).then(() => {
                // Do something after the sleep!
            });
        }
        img.classList.remove('load');
        curQuestionNmbr=1;
        pts=0;
        btns.nextBtn.innerText='Next';
        viewNextQuestion(nextQuestionData,nextImg);
    }

    function getBestScores(localStorage){
       return JSON.parse(localStorage.getItem('bestScores'));
    }

    function setBestScores(localStorage,bs){
        localStorage.setItem('bestScores',JSON.stringify(bs))
    }

    function getScorePos(localStorage, score){
        bs=getBestScores(localStorage);
        if(!Array.isArray(bs)) return {'save':true, 'bs':bs, 'score': score, 'scorePos':0};
        for(let i=0;i<bs.length;i++) 
            if (parseInt(bs[i].score) < score) return {'save':true, 'bs':bs, 'score': score, 'scorePos':i};
        if(bs.length<bestScoresQuant) return {'save':true, 'bs':bs, 'score': score, 'scorePos':bs.length};  
        return {'save':false};
    }

    function saveScore(localStorage, getScorePosDt, username){
        console.log('saveScr',getScorePosDt,username);
        if (getScorePosDt.save===true){
            let t={'score': getScorePosDt.score, 'username': username};
            if (getScorePosDt.scorePos){
                getScorePosDt.bs.splice(getScorePosDt.scorePos,0,t);
                getScorePosDt.bs.splice(bestScoresQuant);
                setBestScores(localStorage,getScorePosDt.bs);
            }
            else setBestScores(localStorage,[t]);
        }
    }

    function setDisplayNone(element,yes=true,fadeIn=true){
        if (yes){
            // element.removeEventListener('onanimationend',onAnimationEnd);
            element.classList.add('dsp-none');
            element.classList.remove('fade-in');
            element.classList.remove('fade-out');
            // element.classList.add('dsp-none');/
            return;
        }
        // element.classList.remove('fade-in');
        element.classList.remove('fade-out');
        element.classList.remove('dsp-none');
        if (fadeIn) element.classList.add('fade-in');
        // element.classList.add('fade-out');
        // console.log('setVis,anim name', element.style.animationDuration);
        // element.addEventListener('onanimationend',onAnimationEnd);//ne radi
    }

    function setFade(element,fadeIn=true){
        if (fadeIn){
            // element.removeEventListener('onanimationend',onAnimationEnd);
            element.classList.remove('dsp-none');
            element.classList.remove('fade-out');
            element.classList.add('fade-in');
            return;
        }
        // element.classList.remove('fade-in');
        element.classList.remove('fade-in');
        element.classList.add('fade-out');
        // console.log('setVis,anim name', element.style.animationDuration);
        // element.addEventListener('onanimationend',onAnimationEnd);//ne radi
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

    function prepNewQuestion(qGen,img){
        nextQuestionData=qGen.next().value;
        nextImg=preloadImage(img,nextQuestionData.qa.image);
    }

    function preloadImage(prevImg,url)
    {
        let img=prevImg.cloneNode(true);
        img.src=url;//Dodati Url filter/validaciju
        return img;
        // img.addEventListener('onload',onPreloadImg);
    }

    function viewNextQuestion(qd,newImg){
        console.log(answers);
        curQuestionData=qd;
        img.classList.remove('load');
        if(newImg!==null){
            img.parentNode.replaceChild(newImg, img);
            img=newImg;
        }
        else{
            img.src=qd.qa.image;
        }
        img.classList.remove('load');
        document.getElementById('questionNmbr').innerText=curQuestionNmbr;
        for(i=0;i<ansbtns.length;i++) ansbtns[i].childNodes[0].innerText=qd.choices[i];
        allAnswersTextOnly(ansbtns);
        allAnswersClickable(true);
        switchToView(viewDivs.main);
        prepNewQuestion(qGen,img);
    }

    function onImgLoaded(){//da li ukloniti ovo?
        // setFade(img,true);
        img.classList.add('load');
        // console.log("IMG LOADED");
    }

    window.onanimationend = e => {
        // stacksnippet's console also has CSS animations...
        console.log({ // logging the full event will kill the page
            target: e.target,
            tagName: e.target.tagName,
            type: e.type,
            animationName: e.animationName
            // animationDur: e.animationDuration
            });
        if(e.animationName === 'fadeOut'){
            if(e.target.id=='cln'){
                e.target.parentNode.removeChild(e.target);
                return;
            }
            e.target.classList.add('dsp-none');
            e.target.classList.remove('fade-out');
        }
        if(e.animationName === 'fadeIn'){
            e.target.classList.remove('fade-in');
        }
    }

    function onAnswersRecieved(data){
        constanswers=data;
        distinct=getDistinctValues(constanswers);
        // // curQuestionData=qGen.next().value;
        // // viewNextQuestion(curQuestionData,nextImg);
    }//local store the current question?
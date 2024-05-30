const events=[]
let data = null
let eventBuffer=null
const pos=['Excellent!','Good show!','Well done.','Nice job.','Oh, you are good.', "Well, that's pretty good.",'Top job!','Brilliant!',"You're a genius!",'Right on!', "Look at you!", "Nice work, smarty pants.","You get bragging rights for that one.","You are marvelous."]
const neg=["Oh, so close.","Missed it by \"that\" much.","You'll get it next time.","Perfection is a process.","Take this as a learning opportunity.","Never give up.","Try, try again.","You only fail if you quit.","That was a hard one.", "Hmmm.  I don't think anyone knows that one.",'Sorry.','So sad.','Not quite.','Ouch.',"This just isn't your day."]
const correctColor = "darkgreen"
const incorrectColor = "darkred"
const monthnames=["January","February","March","April","May","June","July","August","September","October","November","December"]
function chooseCategory(evt){
    console.log(evt)
}

function newGame(){
    //restart game
    showGame(true)
    tag("progress").replaceChildren()
    tag("timebox").replaceChildren()
}

function beginGame(){

    startIndexes=[]
    eventIndex={}
    chosenCategories = []
    let x=0

    tag("timebox").innerHTML=`<div class="bar"><div id="firstPlus" onclick="placeEvent(event)" class="add">+</div></div>`

    for(const elem of document.querySelectorAll(".category-name")){
        //console.log("-------",elem.checked, elem)
        if(elem.checked){
            chosenCategories.push(elem.dataset.categoryName)
        }

    }
    //console.log("chosenCategories",chosenCategories)
    const qNum = tag("event-count").value.trim()
    if(isNaN(qNum)){
        return// TODO: add message
    }
    const localData=data.events
    //get rid of any categories not checked

    for(let e=localData.length-1;e>=0;e--){
        let catFound=false
        for(const cat of fixArray(localData[e].category)){
            if(chosenCategories.includes(cat)){
                catFound=true
                break
            }
        }
        if(!catFound){
            console.log(localData.splice(e,1))
        }
       
    }
    //now local data should have only events from the categories specified
    console.log(localData)


    for(let x=0;x<qNum;x++){
      let theEvent = null
       let done=false
       while(true){
           //pick an event

           console.log(localData.length)
           if(localData.length===0){
              done=true 
              break
           }
           theEvent=localData.splice(randBetween(0,localData.length-1),1)[0]
           theEvent.startIndex=calcDateIndex(theEvent.date)
           theEvent.number=x
           if(theEvent.endDate){
              theEvent.endIndex=calcDateIndex(theEvent.endDate)
           }else{
              theEvent.endIndex=theEvent.startIndex
           }

           //make sure it does not conflict with others
           let conflict=false
           for(const event of events){
              if(theEvent.startIndex<=event.endIndex && theEvent.endIndex>=event.startIndex){
                  conflict=true
                  break
              }
           } 
           if(!conflict){break}
  
       }
       if(done){break}
       startIndexes.push(theEvent.startIndex)
       eventIndex[theEvent.startIndex]=events.length
       events.push(theEvent)
       placeScoreBox(x)
    }

    startIndexes.sort(compareFn)
    console.log("startIndexes",startIndexes)
    
    for(let x=0;x<startIndexes.length;x++){
        events[eventIndex[startIndexes[x]]].sequence=x
    }
  
    for(let x=0;x<events.length;x++){
      console.log (events[x].date, events[x].sequence,events[x].startIndex,events[x].endIndex)
    }

    showGame()
    placeEvent({target:document.getElementById("firstPlus")})
    recordScore(0)
    tag("progress").scrollIntoView()
   
}
function compareFn(a, b) {
    if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    }
    // a must be equal to b
    return 0;
  }
function showGame(intro=false){
    if(intro){
        tag("intro").style.display=""
        tag("progress").style.display="none"
        tag("event").style.display="none"
        tag("timebox").style.display="none"
    }else{
        tag("intro").style.display="none"
        tag("progress").style.display=""
        tag("event").style.display=""
        tag("timebox").style.display=""
    }
}
function fixArray(data){
    if(Array.isArray(data)){
      return data
    }
    return [data]
}
async function init(){
  const params = getParams(location.search)
  const qNum=params.n || 8
  tag("event-count").value=qNum
  const dataPath=params.d || "us.json"
  const response=await fetch(dataPath)
  data = await response.json()
  console.log("data",data)

  const mainMessage=data.message || "<p>Choose one or more categories below to begin.</p>"

  tag("main-message").innerHTML=mainMessage

  data.index={}
  for(let c=0;c<data.categories.length;c++){
    data.index[data.categories[c].name]=c
    data.categories[c].count=0
  }

  for(const event of data.events){
    for(category of fixArray(event.category)){
        console.log("category",category)
        data.categories[data.index[category]].count++
    } 
  }
  const html=["<table>"]
  for(const category of data.categories){
    html.push(`<tr><td><input id="${category.name.toLowerCase().split(" ").join("-")}" type="checkbox" onclick="chooseCategory(event)" checked="checked"  class="category-name" data-category-name="${category.name}"></td><td><b>${category.name}</b></td></tr>`)
    html.push(`<tr><td></td><td>${category.description}</td></tr>`)
    html.push(`<tr><td></td><td style="color:darkgrey">Questions: ${category.count}</td></tr>`)
    html.push(`<tr><td colspan="2">&nbsp;</td></tr>`)
  }
  html.push("</table>")
  tag("category").innerHTML=html.join("")
  console.log(data)



}

function monthName(monthNumber){
    const moNum=parseInt(monthNumber)
    return(monthnames[moNum-1])
}

function dateString(theEvent){
    const fmtDate = formatDate(theEvent.date)
    if(theEvent.endDate){
      //has a start and an end date
      return fmtDate + " - " + formatDate(theEvent.endDate)   
    }else if(theEvent.dateText){
        return theEvent.dateText
    }
    // only a start Date

    return fmtDate 
}

function formatDate(theDate){

    const dateTimeArray = theDate.split(" ")
    const dateArray = dateTimeArray[0].split("-")
    if(dateTimeArray.length===1){
        // there is only a date
        
        if(dateArray.length===1){
            // only a year
            return dateArray[0]
        }else if(dateArray.length===2){
            //year and month
            return monthName(dateArray[1]) + ", " + dateArray[0]
        }
        return monthName(dateArray[1]) + " " + parseInt(dateArray[2]) + ", " + dateArray[0]
    }
    
    //there is a date and a time  We assume teh date is fully specified
    
    const timeArray = theDate.split(":")
    let ampm="AM"
    if(parseInt(timeArray[0])>11){
        ampm="PM"
     }
     if(parseInt(timeArray[0])>12){
        timeArray[0]=parseInt(timeArray[0])-12
     }
      return timeArray[0] + ":" + timeArray[0].padStart(2,"0") + " " + ampm + " " + monthName(dataArray[1]) + " " + parseInt(dateArray[2]) + ", " + dateArray[0]

}

function calcDateIndex(theDate){
    const dateTimeArray = theDate.split(" ")
    if(dateTimeArray.length<2){
       dateTimeArray.push("00:00")
    }
    const timeArray = dateTimeArray[1].split(":")
    const dateArray = dateTimeArray[0].split("-")
    if(dateArray.length===1){
        //YEAR ONLY
        dateArray.push(7)
    }
    if(dateArray.length===2){
        //no day
        dateArray.push(1)
    }

    const d = new Date(`${dateArray[0]}-${dateArray[1]}-${dateArray[2]} ${timeArray[0]}:${timeArray[1]}`)
    return d.getTime()
}

function placeScoreBox(num){
    const div = document.createElement("div")
    div.className="score"
    div.id="score-"+num
    div.style.backgroundColor="#555"
    div.style.color="#777"
    div.innerHTML=num+1
    tag("progress").appendChild(div)
}
function recordScore(num, correct=true){
    tag("score-"+num).style.color="white"
    if(correct){
        tag("score-"+num).style.backgroundColor=correctColor
    }else{
        tag("score-"+num).style.backgroundColor=incorrectColor

    }
}

function showPluses(show=true){
    for(const elem of document.querySelectorAll(".add")){
        if(show){
            elem.style.display=""
        }else{
            elem.style.display="none"
        }
    }
}

function askEvent(){
  const elem=tag("event")
  elem.style.maxHeight=""
  elem.style.overflowY=""
  tag("progress").scrollIntoView()
  elem.style.display=""
  if(events.length<1){
    //we are done, show the score
    tag("event").style.backgroundColor="#ccc"
    tag("event").style.color="black"
    let correct = 0
    let incorrect = 0
    for(const elem of document.querySelectorAll(".score")){
        if(elem.style.backgroundColor===correctColor){
            correct++
        }else{
            incorrect++
        }
    }
    const percent=Math.round((correct/(correct+incorrect))*1000)/10
    const html=[]
    if(data.award){
        if(correct+incorrect >=data.award.eventCount ){
            if(percent >= data.award.percent){
                html.push(`<div class="award">${data.award.message}</div>`)
            }
        }
    }
    html.push(`<div><table align="center"><tr><th colspan="2">Score</th></tr>
    <tr><td>Events:</td><td>${correct+incorrect}</td></tr>
    <tr><td>Correct:</td><td>${correct}</td></tr>
    <tr><td>Incorrect:</td><td>${incorrect}</td></tr>
    <tr><td>Percent:</td><td>${percent}%</td></tr></table></div><p style="text-align:center"><button onclick="newGame()">New Game</button></p>`)
    console.log("html",html)
    elem.innerHTML=html.join("")
    
    showPluses(false)
}else{
    tag("event").style.backgroundColor="darkgreen"
    tag("event").style.color="white"
    elem.innerHTML=eventHtml(events[0])
    //show prompt on first time
    if(tag("score-1").style.backgroundColor===correctColor || tag("score-1").style.backgroundColor===incorrectColor){
        tag("prompt").style.display="none"
    }else{
        tag("prompt").style.display="block"
    }
    showPluses(true)


  }
}

function tag(id){
    return document.getElementById(id)
}

function scorePalcement(theEvent){
  const timeBox=tag("timebox")
  const tags=timeBox.querySelectorAll(".event-container")
  let correct=true
  for(let x=0;x<tags.length;x++){
    const elem = tags[x]
    console.log(elem.dataset.sequence,theEvent.sequence, elem.id)
    console.log("theevent",theEvent)
    if(parseInt(elem.dataset.sequence)===theEvent.sequence){
        // This is the one that was just placed
        if(x>0 && x<tags.length){console.log("--->",tags[x-1].dataset.sequence,tags[x].dataset.sequence)}

        if((x>0 && parseInt(tags[x-1].dataset.sequence) > parseInt(tags[x].dataset.sequence))||(x<tags.length-1 && parseInt(tags[x].dataset.sequence) > parseInt(tags[x+1].dataset.sequence))){
            //misplaced
            //elem.querySelector(".header").style.backgroundColor="darkred"
            correct=false
            console.log("placed",tags[x])
            break
        }
    }

    
  }
  recordScore(theEvent.number,correct)
  const elem=tag("message")
  if(tags.length===1){
      elem.innerHTML=`We've placed the first one for you.  Now you choose if the next one goes before or after.<br><br><span class="tap">Tap to continue</span>.`
  }else if(correct){
    elem.innerHTML=pos[randBetween(0,pos.length-1)] + ` <span class="tap-green">Tap to continue</span>.`
    elem.style.backgroundColor= correctColor
    elem.style.color= "white"
  }else{
    elem.innerHTML=neg[randBetween(0,neg.length-1)] +  ` We'll put it in the right place when you <span class="tap-red">tap to continue</span>.`
    elem.style.backgroundColor= incorrectColor
    elem.style.color= "white"
  }

}

function proceed(evt){
    console.log(evt)
    let m=evt.target
    
    while(m.id!=="message"){
        m=m.parentElement
    }
    
    const elem=m.previousElementSibling
    elem.style.zoom=1
    let needToMove=false
    
    if(m.style.backgroundColor===incorrectColor){
        needToMove=true
    }

    m.remove()

    if(needToMove){
        if(elem.previousElementSibling.className==="bar"){
            elem.previousElementSibling.remove()
        }else{
            elem.nextElementSibling.remove()
        }
        elem.remove()
        placeEvent()
    }
    askEvent()  
}

function placeEvent(evt){
    let moving=false
    if(evt){
        // the user is telling us were to put the event or it's the first event
        eventBuffer=events.shift()
    }else{
        // user did not specify where to place the event, we need to figure it out, also, we'll use the existing eventbuffer to get the event
        
        const tags=tag("timebox").querySelectorAll(".event-container")
        let foundIndex=0
        for(let x=0;x<tags.length;x++){
            //console.log("-----",x,eventBuffer.sequence,tags[x].dataset.sequence)
          if(eventBuffer.sequence>tags[x].dataset.sequence){
            foundIndex=x+1
          }
        }

        let plus = tags[tags.length-1].nextElementSibling
        if(foundIndex < tags.length){
            //place where found
            plus = tags[foundIndex].previousElementSibling
        }
        evt={target:plus}
        moving=true
    }
    const theEvent=eventBuffer


    const elem = evt.target
    const div = document.createElement("div")
    const bar = document.createElement("div")
    const msg = document.createElement("div")
    msg.id="message"
    msg.addEventListener('click', proceed)
    bar.appendChild(div)
    bar.className="bar"
    div.className="add"
    div.innerHTML="+"
    bar.appendChild(div)
    div.addEventListener('click', placeEvent)
    placeDiv(elem,true,bar)
    const eContainer=document.createElement("div")
    eContainer.className="event-container"
    const eDiv=document.createElement("div")
    eDiv.className="event"   
    const header = document.createElement("div")
    header.className="header"


    eContainer.dataset.sequence=theEvent.sequence
    eContainer.id="event-"+theEvent.number
    var html=[`<table style="width:100%; color:white;text-align:center"><tr><td style="cursor:pointer" onclick="toggleHeight(this)">&nbsp;-</td><td style="width:100%">${dateString(theEvent)}</td></tr></table>`]
    header.innerHTML=html.join("")
    eContainer.appendChild(header)
    eContainer.appendChild(eDiv)
    
    eDiv.innerHTML=eventHtml(theEvent)
    placeDiv(elem,true,eContainer)

    if(moving){
        eContainer.querySelector(".header").style.backgroundColor=incorrectColor
    }else{
        eContainer.style.zoom = .5
        placeDiv(elem,true,msg)
        scorePalcement(theEvent)
        tag("event").style.display="none"
        showPluses(false)

    }
    const theImage = eContainer.querySelector("img")
    console.log("theImage",theImage)
    console.log("h",theImage.height)
    eDiv.style.minHeight=theImage.height + "px" 
  
}

function eventHtml(theEvent){
    const html=[`<img style="max-width:100;max-height:100;margin-right:1rem" src="${theEvent.image}" align="left">`]
    html.push(`<b>${theEvent.name}</b>`)
    html.push(`<br><span style="font-size:small">${theEvent.text}</span>`)
    return html.join("")   
}

function toggleHeight(elem){

    let e = elem
    while(e.className!=="event-container"){
         e=e.parentElement
    } 
    
    if("&nbsp;-" === elem.innerHTML){
        elem.innerHTML = "&nbsp;+"
        
        e.style.maxHeight="100px"
        e.style.overflowY="clip"
    }else{
        elem.innerHTML = "&nbsp;-" 
  
        e.style.maxHeight=""
        e.style.overflowY=""

    }
}
function placeDiv(elem, before=true, div){
    let e=elem
    console.log(e.classList)
    while(e.className!=="bar"){
        console.log(e)
        e=e.parentElement
    }
    console.log(e,e.parentElement)

    
    if(before){
        e.insertAdjacentElement("beforeBegin",div)
    }else{
        e.insertAdjacentElement("afterEnd",div)
    }
    
}





function randBetween(x,y){
    return Math.floor(Math.random() * (y+1-x))+x
}

function getParams(query_string) {
  if (!query_string) {
      query_string = ""
    }
    const url_params_array = query_string.split("?").join("").split("&")
    const url_params = {}
  
    for (let x = 0; x < url_params_array.length; x++) {
      // returns the params from the url as an object
      const temp = url_params_array[x].split("=")
      url_params[decodeURI(temp[0])] = decodeURI(temp[1])
    }
    return url_params
  }

  function unstick(elem){
    if(elem.style.overflowY==="clip"){
        elem.style.maxHeight=""
        elem.style.overflowY=""
    }else{
        elem.style.maxHeight="100px"
        elem.style.overflowY="clip"
    }
  }
let unregisterFilterEventListener = null;
let unregisterMarkSelectionEventListener = null;
let worksheet = null;
let worksheetName = null;
let categoryColumnNumber = null;
let valueColumnNumber = null;





$(document).ready(function () {
   tableau.extensions.initializeAsync().then(function () {
      // Draw the chart when initialising the dashboard.
      getSettings();
      drawChartJS();
      // Set up the Settings Event Listener.
      unregisterSettingsEventListener = tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent) => {
         // On settings change.
      getSettings();
       drawChartJS();
      });
   }, function () { console.log('Error while Initializing: ' +err.toString()); });
});









function getSettings() {
   // Once the settings change populate global variables from the settings.

   const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;

   var worksheet = worksheets.find(function (sheet) {
     return sheet.name === "fraud";
   });

   // If settings are changed we will unregister and re register the listener.
   if (unregisterFilterEventListener != null) {
      unregisterFilterEventListener();
   }

   // If settings are changed we will unregister and re register the listener.
   if (unregisterMarkSelectionEventListener != null) {
      unregisterMarkSelectionEventListener();
   }

   // Get worksheet


   // Add listener
   unregisterFilterEventListener = worksheet.addEventListener(tableau.TableauEventType.FilterChanged, (filterEvent) => {
      drawChartJS();
   });

   unregisterMarkSelectionEventListener = worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, (filterEvent) => {
      drawChartJS();
   });
}




function drawChartJS() {

   const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;

   var worksheet = worksheets.find(function (sheet) {
     return sheet.name === "fraud";
   });

   

   worksheet.getSummaryDataAsync().then(function (sumdata) {
     
    $(".Break-Heat-Map").empty();
    $('.table-DealerTop').DataTable().clear().destroy();
    $('.table-roundTop').DataTable().clear().destroy();
    $('.table-bettop').DataTable().clear().destroy();

     const RoundTime = 0,
           UserId = 5,
           UserName= 6,
           CompanyCode = 1;
           RoundID = 2,
           GameType = 4,
           BetPosition = 7,
           DealerName = 3,
           TableName = 6,
           BetEUR = 8,
           NetEUR = 9;

           let RoundSkipp = 0;
           let ShortBreak = 0;
           let LongBreak = 0;
           let SequentialGame = 0;

           let indexStart,
               indexNext;
          
           let TotalBet = 0;
           let TotalNet = 0;

           let RoundArry= [];
           let RoundArry2= [];
           let RatioArry= [];

            let totaltest = 0;
            var worksheetData = sumdata.data;
     
            let DealerArry =[];
            let BetPositionArry =[];
            let TableArry = [];

            let up = 0,
            down = 0,
            same = 0,
            negativ = 0,
            martingeil = 0,
            chaotic = 0;

            SideBetArry = ["Banker Bonus", "Banker Pair", "Phoenix Pair", "Player Bonus","Player Pair", "Small","Super 6"];
            


            



function Trigger(){

  $('.UserName').text(worksheetData[0][UserId].formattedValue);
  $('.CompanyCode').text(worksheetData[0][CompanyCode].formattedValue);

  for (var i = 0; i < worksheetData.length; i++) {

    indexStart = i;
      
    if(i == worksheetData.length - 1){

      indexNext =  worksheetData.length -1


    }else{
      indexNext = i + 1
    }
                              
    if(worksheetData.length > 4){
    //  BreakCounter(indexStart,indexNext)
    }
    totalCounter(indexStart)
    RoundTotla(indexStart,indexNext)
    FraudPattern(indexStart)
  }

}
Trigger();

  function totalCounter(indexStart){
//Tableau Bet and Net messure Sum
   TotalBet += worksheetData[indexStart][BetEUR].value;
   TotalNet += worksheetData[indexStart][NetEUR].value;

  }

  let Margin = TotalNet / TotalBet * 100;
  console.log("Margin : " + Margin)
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  $('.Totalbet').text("€ " + TotalBet.toLocaleString('en-US', {
    minimumFractionDigits: 2
  }));
  $('.Totalnet').text("€ " + TotalNet.toLocaleString('en-US', {
    minimumFractionDigits: 2
  }));
  $('.Margin').text(Margin.toFixed(2) + "%");
  $('.margin-bar').css('width', Margin.toFixed(2) + "%");




/*

  function BreakCounter(indexStart,indexNext){

   // console.log("start index " + indexStart)
 //   console.log("end index "+ indexNext)

   //console.log(worksheetData[0][UserId])

    var startTime=moment(worksheetData[indexStart][RoundTime].formattedValue, "DD-MM-YYYY HH:mm:ss a");
    var endTime=moment(worksheetData[indexNext][RoundTime].formattedValue, "DD-MM-YYYY HH:mm:ss a");
    var duration = moment.duration(endTime.diff(startTime));
    var hours = parseInt(duration.asHours());
    var minutes = parseInt(duration.asMinutes())-hours*60;

//    console.log((hours + ' hour and '+ minutes+' minutes.'))
       
   //    var result = endTime.diff(startTime, 'hours') + " Hrs and " +     
   //                     endTime.diff(startTime, 'minutes') + " Mns";
//SKIP
      if(hours == 0 && minutes > 2 && minutes <= 10 && worksheetData[indexStart][RoundID].formattedValue !== worksheetData[indexNext][RoundID].formattedValue){
        RoundSkipp += 1;
        $('.skipcnt').text("format");
        $('.break-Heat-Map').append('<div class="badge-sqr badge-skip-c"></div>')
//SHORT        
      }else if(hours == 0 && minutes > 10 && minutes <= 30 && worksheetData[indexStart][RoundID].formattedValue !== worksheetData[indexNext][RoundID].formattedValue){
        ShortBreak += 1;
        $('.break-Heat-Map').append('<div class="badge-sqr badge-short-c"></div>')
//LONG        
      }else if(hours >= 1 || minutes >= 31 && worksheetData[indexStart][RoundID].formattedValue !== worksheetData[indexNext][RoundID].formattedValue){
        LongBreak += 1;
        $('.break-Heat-Map').append('<div class="badge-sqr badge-long-c"></div>')
// Sequential        
      }else if(worksheetData[indexStart][RoundID].formattedValue !== worksheetData[indexNext][RoundID].formattedValue || indexStart == 0){
        SequentialGame += 1;
        $('.break-Heat-Map').append('<div class="badge-sqr badge-sql-c"></div>')
      }

   $('.skipcnt').text(RoundSkipp);
  $('.shortcnt').text(ShortBreak);
  $('.longcnt').text(LongBreak);
  $('.seqcnt').text(SequentialGame);


              
  }


*/

function RoundTotla(indexStart,indexNext){

  let index = RoundArry.findIndex(object => object.RoundId === worksheetData[indexStart][RoundID].formattedValue);
  let index2 = DealerArry.findIndex(object => object.DealerName === worksheetData[indexStart][DealerName].formattedValue);
  let index3 = BetPositionArry.findIndex(object => object.BetPosition === worksheetData[indexStart][BetPosition].formattedValue);
  let index4 = TableArry.findIndex(object => object.TableName === worksheetData[indexStart][TableName].formattedValue);

  if (index === -1) {

    RoundArry.push({
      RoundId: worksheetData[indexStart][RoundID].formattedValue,
      TotalRoundBet: 0,
      TotalRoundNet:0,
      DealerName: worksheetData[indexStart][DealerName].formattedValue,
      TableName: worksheetData[indexStart][TableName].formattedValue,
      Margin: 0,
      RoundTime: worksheetData[indexStart][RoundTime].formattedValue

    })
  }
  
  if (index2 === -1) {
    DealerArry.push({
      DealerName: worksheetData[indexStart][DealerName].formattedValue,
      TotalBet: 0,
      TotalNet:0,
      RoundCount :0

    })
  }

////// IF INCLUDES

/*
  const sentence = 'The quick brown foxxxx jumps over the lazy dog.';

  const word = 'fox';
  
  //console.log(`The word "${word}" ${sentence.includes(word) ? 'is' : 'is not'} in the sentence`);
  // expected output: "The word "fox" is in the sentence"
  if(sentence.includes(word) == true){
  console.log("hellow")
  }
*/
  if (index3 === -1) {


    BetPositionArry.push({
      BetPosition: worksheetData[indexStart][BetPosition].formattedValue,
      TotalBet: 0,
      TotalNet:0,
      RoundCount :0,


    })
  }



  let element = RoundArry.find(e => e.RoundId === worksheetData[indexStart][RoundID].formattedValue);
  if (element) {
    element.TotalRoundBet += worksheetData[indexStart][BetEUR].value;
    element.TotalRoundNet += worksheetData[indexStart][NetEUR].value;
}

let element2 = DealerArry.find(e => e.DealerName === worksheetData[indexStart][DealerName].formattedValue);
if (element2 ) {
  element2.TotalBet += worksheetData[indexStart][BetEUR].value;
  element2.TotalNet += worksheetData[indexStart][NetEUR].value;
 
}

let element3 = BetPositionArry.find(e => e.BetPosition === worksheetData[indexStart][BetPosition].formattedValue);
let BetCategory;

if(SideBetArry.find(element => element === worksheetData[indexStart][BetPosition].formattedValue )){
  console.log("element found")
  BetCategory = "SideBet"
}else{
  BetCategory = "MainBet"
}
if (element3 ) {
  element3.TotalBet += worksheetData[indexStart][BetEUR].value;
  element3.TotalNet += worksheetData[indexStart][NetEUR].value;
  element3.RoundCount += 1;
  element3.Category = BetCategory;
 
}

}


console.log(BetPositionArry)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function BreakCounter(){

  // console.log("start index " + indexStart)
//   console.log("end index "+ indexNext)

  //console.log(worksheetData[0][UserId])

  for(i = 0; i < RoundArry.length; i++){

    let indexStart = i;
    let indexNext = 0;
      
    if(i == RoundArry.length - 1){

      indexNext =  RoundArry.length -1


    }else{
      indexNext = i + 1
    }
    
    var startTime=moment(RoundArry[indexStart].RoundTime, "DD-MM-YYYY HH:mm:ss a");
    var endTime=moment(RoundArry[indexNext].RoundTime, "DD-MM-YYYY HH:mm:ss a");
    var duration = moment.duration(endTime.diff(startTime));
    var hours = parseInt(duration.asHours());
    var minutes = parseInt(duration.asMinutes())-hours*60;

 
 //    console.log((hours + ' hour and '+ minutes+' minutes.'))
       
   //    var result = endTime.diff(startTime, 'hours') + " Hrs and " +     
   //                     endTime.diff(startTime, 'minutes') + " Mns";


 //SKIP
      if(hours == 0 && minutes > 2 && minutes <= 10 && RoundArry[indexStart].RoundId !== RoundArry[indexNext].RoundId){
        RoundSkipp += 1;
        $('.skipcnt').text("format");
        $('.break-Heat-Map').append('<div class="badge-sqr badge-skip-c"></div>')
 //SHORT        
      }else if(hours == 0 && minutes > 10 && minutes <= 30 &&  RoundArry[indexStart].RoundId !== RoundArry[indexNext].RoundId){
        ShortBreak += 1;
        $('.break-Heat-Map').append('<div class="badge-sqr badge-short-c"></div>')
 //LONG        
      }else if(hours >= 1 || minutes >= 31 &&  RoundArry[indexStart].RoundId !== RoundArry[indexNext].RoundId){
        LongBreak += 1;
        $('.break-Heat-Map').append('<div class="badge-sqr badge-long-c"></div>')
 // Sequential        
      }else if( RoundArry[indexStart].RoundId !== RoundArry[indexNext].RoundId || indexStart == 0){
        SequentialGame += 1;
        $('.break-Heat-Map').append('<div class="badge-sqr badge-sql-c"></div>')
      }
 
      
   $('.skipcnt').text(RoundSkipp);
  $('.shortcnt').text(ShortBreak);
  $('.longcnt').text(LongBreak);
  $('.seqcnt').text(SequentialGame);
 
  let indexID = i + 3
  let CurrentSqe = $(".badge-sqr")[indexID];



  }
 
let SkippProcent = RoundSkipp / RoundArry.length * 100;
let ShortProcent = ShortBreak / RoundArry.length * 100;
let LongProcent = LongBreak / RoundArry.length * 100;
let SequentialProcent = SequentialGame / RoundArry.length * 100;
//$('.WinProcent').text(WinProcent.toFixed(2) + "%");
//$('.WinProcent-bar').css('width', WinProcent.toFixed(2) + "%");
let BetContinuty;
let BetContinuty2;



if(RoundArry.length  <= 26){
  BetContinuty = "Short Session"
}else if (SkippProcent <= 5 && RoundArry.length >= 11){
  BetContinuty = "Mainly sequentail"
}else if (SkippProcent > 5 && RoundArry.length >= 11){
  BetContinuty = "Mainly sequentail games, however at some passages skips rounds"
}else if (RoundArry.length == 1){
  BetContinuty = "Only One game round held"
}

if(RoundArry.length == 1){
  BetContinuty2 = "Only one game round held"
}else if (ShortBreak == 1 && LongBreak == 0){
  BetContinuty2 = "One short break"
}else if (ShortBreak == 2 && LongBreak == 0 ){
  BetContinuty2 = "Two short break"
}else if (ShortBreak > 3 && LongBreak == 0 ){
  BetContinuty2 = "Several short breaks"
}else if (LongBreak == 1 && ShortBreak == 0 ){
  BetContinuty2 = "One long break"
}else if (LongBreak == 2 && ShortBreak == 0 ){
  BetContinuty2 = "Two long break"
}else if (LongBreak > 3 && ShortBreak == 0 ){
  BetContinuty2 = "Several long break"
}else if (LongBreak == 1 && ShortBreak == 1 ){
  BetContinuty2 = "One short and one long break"
}else if (LongBreak == 2 && ShortBreak == 2 ){
  BetContinuty2 = "Two short and two long break"
}else if (LongBreak > 2 && ShortBreak > 2 ){
  BetContinuty2 = "Several long and short"
}else if (LongBreak == 1 && ShortBreak ==  2 ){
  BetContinuty2 = "One long and two short breaks"
}else if (LongBreak == 2 && ShortBreak ==  1 ){
  BetContinuty2 = "Two long and one short break"
}
else if (LongBreak == 1 && ShortBreak ==  2 ){
  BetContinuty2 = "Two short and one long break"
}else if (LongBreak >= 3 && ShortBreak == 1 ){
  BetContinuty2 = "Several long breaks and one short"
}else if (LongBreak >= 3 && ShortBreak == 2 ){
  BetContinuty2 = "Several long breaks and two short"
}else if (ShortBreak >= 3 && LongBreak == 1 ){
  BetContinuty2 = "Several short breaks and one long"
}else if (ShortBreak >= 3 && LongBreak == 2 ){
  BetContinuty2 = "Several short breaks and two long"
}else if (ShortBreak == 0 && LongBreak == 0 ){
  BetContinuty2 = "No Breaks"
}

   // console.log(SkippProcent) 
   // Betcontinuty    
    $('.Betcontinuty').text(BetContinuty);    
    
    $('.Betcontinuty2').text(BetContinuty2); 
 }
 BreakCounter()


function BetProgression (){

  let TotalBet;

  for (let i = 0; i < RoundArry.length; i++ ){

    TotalBet += RoundArry[i].TotalRoundBet
    let cur = i;
    let next;
    let nextn;

    if(i == RoundArry.length - 1){

      next =  RoundArry.length -1
      nextn  = RoundArry.length -2

    }else{
      next = i + 1
      nextn = i + 2
    }

    if (RoundArry[cur].TotalRoundBet == RoundArry[next].TotalRoundBet){
      same += 1; //Flat
    }else if(RoundArry[cur].TotalRoundBet < RoundArry[next].TotalRoundBet && RoundArry[cur].TotalRoundNet > 0){
      up += 1; // Positive
    }else if (RoundArry[cur].TotalRoundNet <= 0 && RoundArry[cur].TotalRoundBet * 2 <= RoundArry[next].TotalRoundBet){
    
      if(RoundArry[next].TotalRoundNet <= 0 && RoundArry[next].TotalRoundBet * 2 <= RoundArry[nextn].TotalRoundBet){
        martingeil += 1; // Martingale
      }else{
        negativ += 1; // Negative
      }
        
      }
    
    else{
      chaotic += 1; // chaotic
    }
    
    /*
    
    if (RoundArry[cur].TotalRoundBet == RoundArry[next].TotalRoundBet){
      same += 1;
    }else if (RoundArry[cur].TotalRoundNet <= 0 && RoundArry[cur].TotalRoundBet * 2 <= RoundArry[next].TotalRoundBet){
    
    if(RoundArry[next].TotalRoundNet <= 0 && RoundArry[next].TotalRoundBet * 2 <= RoundArry[nextn].TotalRoundBet){
      martingeil += 1;
    }
      negativ += 1;
    }
    
    if(RoundArry[cur].TotalRoundBet < RoundArry[next].TotalRoundBet && RoundArry[cur].TotalRoundNet > 0){
      up += 1;
    }else{
      chaotic += 1;
    }

      */

    
    }


/*

let up = 0,
down = 0,
same = 0,
negativ = 0,
martingeil = 0;
chaotic
*/

let UpProcent = up / RoundArry.length * 100;
let DownProcent = down / RoundArry.length * 100;
let SameProcent = same / RoundArry.length * 100;
let NegativProcent = negativ / RoundArry.length * 100;
let MartingeilProcent = martingeil / RoundArry.length * 100;
let ChaoticProcent = chaotic / RoundArry.length * 100;

//console.log("Same " + SameProcent)


//console.log("UP " + UpProcent)
//console.log("Down " + DownProcent)
//console.log("Negativ " + NegativProcent)
//console.log("Martingeil " + MartingeilProcent)
//console.log("Chaotic " + ChaoticProcent)

let bettingprogression;

if(SameProcent  >= 70.00 ){
  console.log("Flat wager") // Flat wager
  bettingprogression = "Flat wager"
}else if (SameProcent  >= 69.00){
  console.log("Mainly flat wager") // Mainly flat wager
  bettingprogression = "Mainly flat wager"
}else if (SameProcent  >= 68.00 && UpProcent >= 32.00){
  console.log("Mainly flat wager at some passage possitive progression") // Mainly flat wager at some passage possitive progression
  bettingprogression ="Mainly flat wager at some passage possitive progression"
}else if (SameProcent  >= 30.00 && NegativProcent >= 70.00){
  console.log("Negative  progression, however at some passages flat") // Negative  progression, however at some passages flat
  bettingprogression = "Negative  progression, however at some passages flat"
}else if (UpProcent >= 85.00){
  console.log("Possitive progression") // Negative  progression, however at some passages flat
  bettingprogression = "Possitive progression"
}else if (DownProcent >= 85.00){
  console.log("Negative progression") // Negative  progression
  bettingprogression = "Negative progression"
}else if (DownProcent >= 50.00 && UpProcent >= 50.00){
  console.log("Chaotic wagers, regardless to previous game outcome") // Chaotic wagers, regardless to previous game outcome
  bettingprogression = "Chaotic wagers, regardless to previous game outcome"
}else if (ChaoticProcent >= 85.00){
  console.log("Chaotic") // Chaotic  progression
  bettingprogression = "Chaotic"
}else if (ChaoticProcent >= 20.00 && SameProcent >= 30.00){ 
  console.log("Chaotic, however at some pasage flat wager") // Chaotic  progression -----------GOOD
  bettingprogression = "Chaotic, however at some pasage flat wager"
}else if (ChaoticProcent >= 60.00 && SameProcent >= 20.00 && NegativProcent >= 20.00){
  console.log("Chaotic, however at some passage flat wager and at some passage negative progression") // Chaotic, however at some passage flat wager and at some passage negative progression
  bettingprogression = "Chaotic, however at some passage flat wager and at some passage negative progression"
}else if (ChaoticProcent >= 60.00 && NegativProcent >= 40.00){
  console.log("Chaotic, however at some passage fegative progression") // Chaotic, however at some passage fegative progression
  bettingprogression = "Chaotic, however at some passage fegative progression"
}else{
  console.log("Betting progression Chaotic")
  bettingprogression = "Betting progression Chaotic"
}

$(".bettingProgression").text(bettingprogression)

}



BetProgression ()





//console.log(same + " - Falt" )
//console.log(negativ + " - Negative" )
//console.log(martingeil + " - Matingeil")
//console.log(up + " - Positive")
//console.log(chaotic + " - Chaotic")



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

console.log(RoundArry)
console.log(BetPositionArry)

//const results = RoundArry.filter(({ DealerName: id1 }) => !DealerArry.some(({ DealerName: id2 }) => id2 === id1));


let WinRoundCnt = 0;
let LossRoundCnt = 0;
let TieRoundCnt = 0;

let MainBet = {},
    SideBetSma = {};

function FraudPattern(indexStart){
  // Process data for fraud detection analysis
  const playerData = {
    rounds: [],
    sideBets: {},
    sharedIPCount: 0,  // This would come from backend data in a real implementation
    complementaryBettingScore: 0  // This would come from backend data in a real implementation
  };
  
  try {
    // Prepare data for analysis - convert worksheet data to the format needed by fraud detection
    for (let i = 0; i < worksheetData.length; i++) {
      try {
        // Defensive data extraction with type checking and conversion
        const roundId = worksheetData[i][RoundID]?.formattedValue || worksheetData[i][RoundID]?.value || '';
        const betEUR = parseFloat(worksheetData[i][BetEUR]?.value) || 0;
        const netEUR = parseFloat(worksheetData[i][NetEUR]?.value) || 0;
        const betPosition = worksheetData[i][BetPosition]?.formattedValue || worksheetData[i][BetPosition]?.value || '';
        const timestamp = worksheetData[i][RoundTime]?.formattedValue || worksheetData[i][RoundTime]?.value || '';
        const dealerName = worksheetData[i][DealerName]?.formattedValue || worksheetData[i][DealerName]?.value || '';
        
        // Skip invalid rows (missing essential data)
        if (!roundId || !dealerName || isNaN(betEUR) || isNaN(netEUR)) {
          console.warn(`Skipping invalid row ${i}: missing essential data`);
          continue;
        }
        
        const roundData = {
          roundId: roundId,
          betEUR: betEUR,
          netEUR: netEUR,
          betPosition: betPosition,
          timestamp: timestamp,
          dealerName: dealerName
        };
        
        playerData.rounds.push(roundData);
        
        // Track side bets (only if betPosition is valid)
        if (betPosition && SideBetArry.some(sideBet => betPosition.includes(sideBet))) {
          if (!playerData.sideBets[betPosition]) {
            playerData.sideBets[betPosition] = { count: 0, wins: 0 };
          }
          playerData.sideBets[betPosition].count++;
          if (netEUR > 0) {
            playerData.sideBets[betPosition].wins++;
          }
        }
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        // Display error in UI
        $('.Fraud').replaceWith(`<p class="Fraud in-line highlight-h" style="color: red;">Error processing row ${i}: ${error.message}</p>`);
        return; // Exit early to prevent further crashes
      }
    }
    
    // For demo purposes, add some simulated risk factors based on patterns in the data
    if (playerData.rounds.length >= 20) {
      let winCount = 0;
      playerData.rounds.forEach(round => {
        if (round.netEUR > 0) winCount++;
      });
      
      const winRate = winCount / playerData.rounds.length;
      if (winRate > 0.6) {
        // Simulate complementary betting with other players for high win rates
        playerData.complementaryBettingScore = Math.min(0.9, winRate);
      }
    }
    
    // Run fraud detection analysis
    try {
      const fraudResults = FraudDetection.detectFraudPatterns(playerData);
      
      // Update the UI with the fraud detection results
      $('.Fraud').replaceWith(FraudDetection.formatFraudDetectionResults(fraudResults));
    } catch (error) {
      console.error('Error in fraud detection analysis:', error);
      // Display detailed error in UI
      $('.Fraud').replaceWith(`<p class="Fraud in-line highlight-h" style="color: red;">Fraud Analysis Error: ${error.message}</p>`);
    }
  } catch (error) {
    console.error('Critical error in FraudPattern function:', error);
    // Display critical error in UI
    $('.Fraud').replaceWith(`<p class="Fraud in-line highlight-h" style="color: red;">Critical Error: ${error.message}</p>`);
  }
}

function RoundTotals (){

  

  for(let i = 0; i < RoundArry.length; i++){
    if(RoundArry[i].TotalRoundNet > 0){
      WinRoundCnt += 1;
    }else if(RoundArry[i].TotalRoundNet < 0){
      LossRoundCnt += 1;
    }else{
      TieRoundCnt += 1;
    }

  }


}

RoundTotals ()

///////////////////////////////////////////////////
$('.total-round-cnt').text(RoundArry.length)
$('.win-round-cnt').text(WinRoundCnt)
$('.loss-round-cnt').text(LossRoundCnt)
$('.tie-round-cnt').text(TieRoundCnt)



let WinProcent = WinRoundCnt / RoundArry.length * 100;
$('.WinProcent').text(WinProcent.toFixed(2) + "%");
$('.WinProcent-bar').css('width', WinProcent.toFixed(2) + "%");



// output = [3,7,5,2]
  // console.log(RoundArry2)


   // let result = RoundArry.map(a => a.RoundId);
   // console.log(RoundArry.map(a => a.RoundId))
   // console.log(RoundArry.map(a => a.TotalRoundBet))
   //console.log(RoundArry)

function DealerTop (){

  for(x = 0; x < RoundArry.length; x++){
    RoundTop(x)
    let element = DealerArry.find(e => e.DealerName === RoundArry[x].DealerName);
if (element ) {
  element.RoundCount += 1;
}
  }

  for(i = 0; i < DealerArry.length; i++){

    $(".DealerTop").append(`
    <tr>
      <td>` + DealerArry[i].DealerName + `</td>
      <td>` + DealerArry[i].TotalBet.toFixed(2) + `</td>
      <td>` + DealerArry[i].TotalNet.toFixed(2) + `</td>
      <td>`+ DealerArry[i].RoundCount +` </td>
      <td>`+ (DealerArry[i].TotalNet.toFixed(2) /  DealerArry[i].TotalBet.toFixed(2) * 100).toFixed(2) +` </td>
      </tr>
      `
    )



  }

  $('.table-DealerTop').DataTable()
  $('.table-roundTop').DataTable()

}

function RoundTop(x){

  $(".RoundTop").append(`
  <tr>
    <td>` + RoundArry[x].RoundId + `</td>
    <td>` + RoundArry[x].TotalRoundBet.toFixed(2) + `</td>
    <td>` + RoundArry[x].TotalRoundNet.toFixed(2) + `</td>
    <td>`+ (RoundArry[x].TotalRoundNet.toFixed(2) /  RoundArry[x].TotalRoundBet.toFixed(2) * 100).toFixed(2)+` % </td>
    </tr>
    `
  )

}

DealerTop ()


function BetPositionTop(){
  
  for(i = 0; i < BetPositionArry.length ; i++){

  


    $(".BetPosTop").append(`
      <tr>
                                          <td>`+ BetPositionArry[i].BetPosition + `</td>
                                            <td>` + BetPositionArry[i].TotalBet.toFixed(2) +`</td>
                                                <td>` + BetPositionArry[i].TotalNet.toFixed(2) +`</td>
                                                <td>`+ (BetPositionArry[i].TotalNet.toFixed(2) /  BetPositionArry[i].TotalBet.toFixed(2) * 100).toFixed(2)+` % </td>
                                                <td>` + BetPositionArry[i].RoundCount +`</td>
                                                <td>
                                                    <div class="d-flex align-items-center">
                                                        <span class="badge badge-success badge-dot m-r-10"></span>
                                                        <span>` + BetPositionArry[i].Category + `</span>
                                                    </div>
                                                </td>
                                            </tr>
    `)
  }
 // $('.table-bettop').DataTable()
 $('.table-bettop').DataTable({
  footerCallback: function (row, data, start, end, display) {
      var api = this.api();

      // Remove the formatting to get integer data for summation
      var intVal = function (i) {
          return typeof i === 'string' ? i.replace(/[\$,]/g, '') * 1 : typeof i === 'number' ? i : 0;
      };

      // Total over all pages
      total = api
          .column(2)
          .data()
          .reduce(function (a, b) {
              return intVal(a) + intVal(b);
          }, 0);

      // Total over this page
      pageTotal = api
          .column(2, { page: 'current' })
          .data()
          .reduce(function (a, b) {
              return intVal(a) + intVal(b);
          }, 0);

      // Update footer
      $(api.column(4).footer()).html(' € ' + pageTotal.toFixed(2) + ' ( € ' + total.toFixed(2) + ' Total)');

  },
});

}


BetPositionTop()

  $("#bar-chart").remove();

  $(".roulette-container").append('<canvas id="bar-chart" style="height: 168px;" ></canvas>');
  $(".roulette-container2").append('<canvas id="bar-chart2" style="height: 80px;" ></canvas>');

new Chart(document.getElementById("bar-chart"), {
    type: 'bar',
    data: {
        labels: RoundArry.map(a => a.RoundId),
        datasets: [
            {
                barPercentage: 0.9,
                categoryPercentage: 1,
                label: "Bet Amount (€)",
                backgroundColor: RoundArry.map(a => a.TotalRoundNet > 0 ? "#81F495" : "#F07D88"), // Green if positive, Red if negative
                data: RoundArry.map(a => a.TotalRoundBet) // Bars represent TotalRoundBet
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                display: false,
                grid: { display: false }
            },
            y: {
                display: false,
                grid: { display: false }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    title: function (tooltipItems) {

                        return `Round Stats`; // Custom title
                    },
                    label: function (tooltipItem) {
                        let index = tooltipItem.dataIndex;
                        let roundId = RoundArry[index].RoundId;
                        let totalBet = RoundArry[index].TotalRoundBet.toFixed(2);
                        let totalNet = RoundArry[index].TotalRoundNet.toFixed(2);

                        return [
                            `Round ID: ${roundId}`,
                            `Bet Amount: €${totalBet}`,
                            `Net Amount: €${totalNet}` // This appears only on hover
                        ];
                    }
                }
            }
        }
    }
});











     

     



      

    
     



     
   });


  
 }




 







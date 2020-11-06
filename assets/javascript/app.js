// Train Scheduler

// Ready Document
$(document).ready(function () {

    // Initialize Firebase
    // Make sure to match the configuration to the script version number in the HTML
    // (Ex. 3.0 != 3.7.0)        
    var config = {
        apiKey: "AIzaSyAwc1CvMHkDJc6Nc7nkh9k6btbSXqIW5HE",
        authDomain: "sandbarfirebaseapp.firebaseapp.com",
        databaseURL: "https://sandbarfirebaseapp.firebaseio.com",
        projectId: "sandbarfirebaseapp",
        storageBucket: "sandbarfirebaseapp.appspot.com",
        messagingSenderId: "344540420048",
        appId: "1:344540420048:web:902a71a12570b21a130bd5",
        measurementId: "G-5QMRHXSJXV"
    };

    firebase.initializeApp(config);

    // Create a variable to reference the database.
    var database = firebase.database();

    // Initial Values
    var trainName = "";
    var destination = "";
    var firstTrain = "";
    var frequency = 0;

    // At the page load and subsequent value changes, get a snapshot of the local data.
    // This function allows you to update your page in real-time when the values within the firebase node bidderData changes
    database.ref("/train-schedule").on("value", function (snapshot) {

        // Get snapshot data
        // trainName = snapshot.val().trainName;
        // destination = snapshot.val().destination;
        // frequency = snapshot.val().frequency;

        // If any errors are experienced, log them to console.
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });

    // At page load and child adds, get snapshot of local data
    database.ref("/train-schedule").on("child_added", function (snapshot) {

        // Get snapshot data
        trainName = snapshot.val().trainName;
        destination = snapshot.val().destination;
        firstTrain = snapshot.val().firstTrain;
        frequency = snapshot.val().frequency;

        // Set calculated values
        var timeArray = firstTrain.split(":");
        var trainTime = moment().hours(timeArray[0]).minutes(timeArray[1]);
        var maxMoment = moment.max(moment(), trainTime);
        var minutesAway = "";
        var nextArrival = "";

        // If the first train is later than the current time, sent arrival to the first train time
        if (maxMoment === trainTime) {
            nextArrival = trainTime.format("hh:mm A");
            minutesAway = trainTime.diff(moment(), "minutes");
        } else {

            // Calculate the minutes until arrival using hardcore math
            // To calculate the minutes till arrival, take the current time in unix subtract the FirstTrain time
            // and find the modulus between the difference and the frequency.
            var differenceTimes = moment().diff(trainTime, "minutes");
            var timeRemainder = differenceTimes % frequency;
            minutesAway = frequency - timeRemainder;
            // To calculate the arrival time, add the tMinutes to the current time
            nextArrival = moment().add(minutesAway, "m").format("hh:mm A");

            // Add row to table
            $("#train-table > tbody").append("<tr><td>" + trainName + "</td><td>" + destination + "</td><td>" +
            frequency + "</td><td>" + nextArrival + "</td><td>" + minutesAway + "</td>");
            
            // Print the local data to the console.
            console.log(snapshot.val());
        }

        // If any errors are experienced, log them to console.
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });

    // Action for Submit button
    $("#submit").on("click", function (event) {
        event.preventDefault();

        // Get the input values
        var trainName = $("#train-name-input").val().trim();
        var destination = $("#destination-input").val().trim();
        var firstTrain = $("#first-train-input").val().trim();
        var frequency = $("#frequency-input").val().trim();

        if (trainName === '' || destination === '' || firstTrain === '' || frequency === '') {
            event.preventDefault();
            alert("Please fill in all fields");
        }
        else {
            // Save data in Firebase
            database.ref("/train-schedule").push({
                trainName: trainName,
                destination: destination,
                firstTrain: firstTrain,
                frequency: frequency
            });

            console.log(trainName);
            console.log(destination);
            console.log(firstTrain);
            console.log(frequency);

            $("#train-form").trigger("reset");
        }
    });

    // Action for Reset button
    $("#reset").on("click", function (event) {
        // Reset data in Firebase
        database.ref("/train-schedule").set({
        });

    });

})



// Solved Mathematically
// Test case 1:
// 16 - 00 = 16
// 16 % 3 = 1 (Modulus is the remainder)
// 3 - 1 = 2 minutes away
// 2 + 3:16 = 3:18

// Solved Mathematically
// Test case 2:
// 16 - 00 = 16
// 16 % 7 = 2 (Modulus is the remainder)
// 7 - 2 = 5 minutes away
// 5 + 3:16 = 3:21
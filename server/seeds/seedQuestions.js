const mongoose = require("mongoose");
const Question = require("../models/Question");
const connectDB = require("../config/DB");

const questions = [
  {
    text: "How many days did it take for you to feel noticeable improvement?",
    type: "number",
    options: ["1-30"],
  },
  {
    text: "Did you experience good sleep during the recovery period?",
    type: "yesNo",
    options: ["Yes", "No"],
  },
  {
    text: "Did you follow all the prescribed medications and treatments?",
    type: "multipleChoice",
    options: ["Yes", "No", "Partially"],
  },
  {
    text: "How consistent were you in taking your prescribed medication?",
    type: "multipleChoice",
    options: ["Never", "Sometimes", "Most of the time", "Always"],
  },
  {
    text: "Did you notice any improvement in your symptoms after starting the medication?",
    type: "yesNo",
    options: ["Yes", "No"],
  },
  {
    text: "Did you feel any unexpected pain or discomfort during the recovery process?",
    type: "yesNo",
    options: ["Yes", "No"],
  },
  {
    text: "Did you experience any side effects from the medication?",
    type: "yesNo",
    options: ["Yes", "No"],
    hasDetails: true, // If "Yes", requires details
  },
  {
    text: "How often did your symptoms reappear after the consultation?",
    type: "multipleChoice",
    options: ["Never", "Rarely", "Often", "Always"],
  },
  {
    text: "Were you able to return to your daily activities as expected?",
    type: "multipleChoice",
    options: ["Yes", "No", "Partially"],
  },
  {
    text: "How would you rate your overall health improvement after the consultation?",
    type: "number",
    options: ["1-5"],
  },
];

const seedQuestions = async () => {
  try {
    await connectDB();
    await Question.deleteMany({});
    console.log("Existing questions cleared.");
    await Question.insertMany(questions);
    console.log("Questions seeded successfully.");
  } catch (error) {
    console.error("Error seeding questions:", error.message);
  } finally {
    mongoose.connection.close();
  }
};

seedQuestions();
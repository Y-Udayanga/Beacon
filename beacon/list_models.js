const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyB2u1f5taYgj190JbW3tWxvUxIwHurGVZ8`);
    const data = await response.json();
    console.log(data.models.map(m => m.name).filter(name => name.includes('gemini')));
  } catch (e) {
    console.error(e);
  }
}

listModels();

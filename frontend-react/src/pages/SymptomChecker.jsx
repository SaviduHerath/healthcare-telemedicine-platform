import React, { useState } from 'react';

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeSymptoms = (e) => {
    e.preventDefault();
    setLoading(true);

    // SIMULATED AI API CALL
    // In a real app, you would send this to OpenAI or a medical API
    setTimeout(() => {
      let specialty = "General Physician";
      const text = symptoms.toLowerCase();
      
      if (text.includes("heart") || text.includes("chest")) specialty = "Cardiologist";
      if (text.includes("skin") || text.includes("rash")) specialty = "Dermatologist";
      if (text.includes("headache") || text.includes("brain")) specialty = "Neurologist";
      if (text.includes("bone") || text.includes("joint")) specialty = "Orthopedist";

      setResult({
        analysis: "Based on your symptoms, we recommend consulting a specialist.",
        specialty: specialty,
        urgency: text.includes("pain") ? "Moderate - Book an appointment soon." : "Low - Routine checkup advised."
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 mt-6">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center">
        <span className="text-2xl mr-2">🤖</span> AI Symptom Checker
      </h2>
      <p className="text-slate-500 mb-4">Describe how you are feeling, and our AI will suggest the right specialist.</p>
      
      <form onSubmit={analyzeSymptoms} className="space-y-4">
        <textarea
          required
          rows="3"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., I have a severe headache and slight fever..."
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        ></textarea>
        <button 
          type="submit" 
          disabled={loading || !symptoms}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition"
        >
          {loading ? 'Analyzing...' : 'Analyze Symptoms'}
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <h3 className="font-bold text-blue-800">AI Assessment Complete</h3>
          <p className="text-blue-700 mt-1">{result.analysis}</p>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded shadow-sm">
              <span className="block text-xs text-slate-500 uppercase font-bold">Recommended Specialist</span>
              <span className="font-semibold text-slate-800">{result.specialty}</span>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <span className="block text-xs text-slate-500 uppercase font-bold">Urgency</span>
              <span className="font-semibold text-slate-800">{result.urgency}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;
import React, { useState } from 'react';
import { Stethoscope } from "lucide-react";
import axios from 'axios';

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState('');

  const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5006/api/symptoms/analyze', { 
        symptoms: symptoms,
        userId: loggedUser?.id || "guest_id", 
        userName: loggedUser?.fullName || "Guest User"
      });

      console.log("AI DATA RECEIVED:", response.data);
      setResult(response.data);
      setLastSubmitted(symptoms);
    } catch (err) {
      alert("AI Service is currently offline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <h1 className="flex items-center justify-center gap-3 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
  
          {/* Medical Icon */}
          <span className="bg-slate-100 p-3 rounded-xl shadow-sm">
            <Stethoscope className="h-8 w-8 text-slate-700" strokeWidth={1.8} />
          </span>

          AI Symptom Assistant
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto mb-6">
          Enter your symptoms below to get AI-powered preliminary medical guidance.
        </p>

        {/* Form */}
        <form onSubmit={handleAnalyze} className="max-w-2xl mx-auto">
          <textarea
            className="w-full h-36 p-4 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-700"
            placeholder="Describe your symptoms... (e.g., headache, fever, nausea for 2 days)"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading || symptoms.trim() === lastSubmitted.trim()}
            className={`mt-4 w-full py-3 rounded-xl font-semibold text-white transition-all shadow-sm ${
              loading || symptoms === lastSubmitted
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Analyzing..." : "Analyze Symptoms"}
          </button>
        </form>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">

          {/* Urgency */}
          <div
            className={`p-4 rounded-xl text-sm font-medium ${
              result.urgency === "High"
                ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-blue-50 text-blue-600 border border-blue-200"
            }`}
          >
            <strong>Urgency Level:</strong> {result.urgency}
          </div>

          {/* Suggestions */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Suggestions
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {result.suggestions}
            </p>
          </div>

          {/* Specialties */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Recommended Doctor Specialties
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.specialties?.map((spec, i) => (
                <span
                  key={i}
                  className="px-4 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-600"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-slate-500 italic border-t pt-4">
            ⚠️ This is an AI-generated suggestion, not a medical diagnosis. 
            In case of emergency, contact medical services immediately.
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;
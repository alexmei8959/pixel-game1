const API_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;

export const fetchQuestions = async (count) => {
  try {
    // 假設 GAS 支援 GET 參數 count
    const response = await fetch(`${API_URL}?action=getQuestions&count=${count}`);
    if (!response.ok) throw new Error('Failed to fetch questions');
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    if (!Array.isArray(data)) throw new Error('Invalid data format');
    return data; 
  } catch (error) {
    console.error('Error fetching questions:', error);
    // 錯誤時回傳假資料以利開發測試
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      question: `This is a mock question ${i + 1}?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: 'Option A'
    }));
  }
};

export const submitAnswers = async (userId, answers, passThreshold) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'submitAnswers',
        userId, 
        answers, 
        passThreshold
      }),
    });
    if (!response.ok) throw new Error('Failed to submit answers');
    return await response.json();
  } catch (error) {
    console.error('Error submitting answers:', error);
    return { success: false };
  }
};


export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">
        MoneyMentor AI
      </h1>

      <p className="mb-6">
        Your Plain-Language Financial Coach
      </p>

      <div className="space-y-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Ask a Financial Question
        </button>

        <button className="px-4 py-2 bg-green-600 text-white rounded">
          Generate Savings Plan
        </button>
      </div>
    </main>
  );
}

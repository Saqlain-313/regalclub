import React, { useState, useEffect } from "react";
import {
  FiRefreshCw,
  FiFileText,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { WithdrawlHistory } from "../Redux/Reducer/paymentReducer";

const Transaction = () => {
  const { withdrawhistory } = useSelector((state) => state.payment);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    dispatch(WithdrawlHistory());
  }, [dispatch]);

  console.log(withdrawhistory, "history");

  // Mock data fetch - replace with actual API call
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data - replace with real data
        const mockTransactions = [
          {
            id: 1,
            type: "deposit",
            amount: 500.0,
            currency: "USD",
            status: "completed",
            date: "2023-06-15T10:30:00Z",
            description: "Wallet funding",
          },
          {
            id: 2,
            type: "withdrawal",
            amount: 250.0,
            currency: "USD",
            status: "pending",
            date: "2023-06-14T14:45:00Z",
            description: "Withdrawal request",
          },
          {
            id: 3,
            type: "trade",
            amount: 150.0,
            currency: "USD",
            status: "completed",
            date: "2023-06-13T09:15:00Z",
            description: "BTC/USD trade",
          },
        ];

        setTransactions(mockTransactions);
        setIsLoading(false);
      } catch (error) {
        setHasError(true);
        setIsLoading(false);
        console.error("Error fetching transactions:", error);
      }
    };

    fetchData();
  }, []);

  const handleRefresh = () => {
    // Implement refresh logic here
    window.location.reload();
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-300">Loading transactions...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-400">
        <FiXCircle className="text-4xl mb-3" />
        <p className="text-xl mb-4">Failed to load transactions</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <FiRefreshCw className="mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  if (transactions?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <FiFileText className="text-4xl text-gray-400 mb-3" />
        <p className="text-xl text-gray-300 mb-4">No transactions found</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <FiRefreshCw className="mr-2" />
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 h-[80vh] overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Transaction History</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
        >
          <FiRefreshCw className="mr-2" />
          Refresh
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {withdrawhistory?.map((transaction) => (
                <tr
                  key={transaction?.id}
                  className="hover:bg-gray-750 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="capitalize text-white">{transaction?.remark}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={transaction?.remark === "deposit" ? 'text-green-400' : 'text-red-400'}>
                      {/* {transaction?.type === 'deposit' ? '+' : '-'} */}
                      {transaction?.amount}
                    </span>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-300">{transaction?.description}</div>
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                    <span
  className={`ml-2 capitalize text-white px-2 py-1 rounded ${
    transaction?.status === 0
      ? "bg-yellow-500"
      : transaction?.status === 1
      ? "bg-green-500"
      : "bg-red-500"
  }`}
>
  {transaction?.status === 0
    ? "Pending"
    : transaction?.status === 1
    ? "Completed"
    : "Failed"}
</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                    {formatDate(transaction?.time)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500 text-center">
        Showing {transactions?.length} transactions
      </div>
    </div>
  );
};

export default Transaction;

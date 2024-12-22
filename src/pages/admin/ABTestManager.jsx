import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function ABTestManager() {
  const [tests, setTests] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTest, setNewTest] = useState({
    name: '',
    description: '',
    variants: [
      { name: 'Control', description: '', configuration: { algorithm: 'hybrid' } },
      { name: 'Variant A', description: '', configuration: { algorithm: 'collaborative' } }
    ]
  });

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await axios.get('/api/admin/ab-tests');
      setTests(response.data.data);
    } catch (error) {
      console.error('Error fetching A/B tests:', error);
    }
  };

  const handleCreateTest = async () => {
    try {
      await axios.post('/api/admin/ab-tests', newTest);
      setIsCreating(false);
      setNewTest({
        name: '',
        description: '',
        variants: [
          { name: 'Control', description: '', configuration: { algorithm: 'hybrid' } },
          { name: 'Variant A', description: '', configuration: { algorithm: 'collaborative' } }
        ]
      });
      fetchTests();
    } catch (error) {
      console.error('Error creating A/B test:', error);
    }
  };

  const handleUpdateTestStatus = async (testId, status) => {
    try {
      await axios.patch(`/api/admin/ab-tests/${testId}/status`, { status });
      fetchTests();
    } catch (error) {
      console.error('Error updating test status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">A/B Tests</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          New Test
        </button>
      </div>

      {isCreating && (
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New A/B Test</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newTest.name}
                onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={newTest.description}
                onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-4">
              {newTest.variants.map((variant, index) => (
                <div key={index} className="border rounded-md p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Variant {index + 1}</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => {
                        const updatedVariants = [...newTest.variants];
                        updatedVariants[index].name = e.target.value;
                        setNewTest({ ...newTest, variants: updatedVariants });
                      }}
                      placeholder="Variant Name"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <select
                      value={variant.configuration.algorithm}
                      onChange={(e) => {
                        const updatedVariants = [...newTest.variants];
                        updatedVariants[index].configuration.algorithm = e.target.value;
                        setNewTest({ ...newTest, variants: updatedVariants });
                      }}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="hybrid">Hybrid</option>
                      <option value="collaborative">Collaborative</option>
                      <option value="content">Content-based</option>
                      <option value="contextual">Contextual</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTest}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Test
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {tests.map((test) => (
            <li key={test.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{test.name}</h3>
                  <p className="text-sm text-gray-500">{test.description}</p>
                  <div className="mt-2 flex space-x-4">
                    {test.variants.map((variant) => (
                      <span
                        key={variant.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {variant.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={test.status}
                    onChange={(e) => handleUpdateTestStatus(test.id, e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="PAUSED">Paused</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 
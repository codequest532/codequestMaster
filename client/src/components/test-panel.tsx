import { useState } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PuzzleWithProgress } from "@shared/schema";

interface TestPanelProps {
  puzzle: PuzzleWithProgress;
  executionResult?: any;
  compilationError?: string;
  submitResult?: any;
}

export default function TestPanel({ puzzle, executionResult, compilationError, submitResult }: TestPanelProps) {
  const [activeTab, setActiveTab] = useState("test-cases");

  const testCases = (puzzle.testCases as any[])?.filter(tc => !tc.hidden) || [];

  return (
    <div className="w-96 bg-card border-l border-border flex flex-col">
      {/* Panel Header - Tab Navigation */}
      <div className="bg-muted border-b border-border px-2 py-2 flex-shrink-0">
        <div className="flex items-center space-x-1 w-full">
          <Button
            variant={activeTab === "test-cases" ? "default" : "ghost"}
            size="sm"
            className="text-xs font-medium px-3 py-2 flex-1"
            onClick={() => setActiveTab("test-cases")}
          >
            Test Cases
          </Button>
          <Button
            variant={activeTab === "output" ? "default" : "ghost"}
            size="sm"
            className="text-xs font-medium px-3 py-2 flex-1"
            onClick={() => setActiveTab("output")}
          >
            Output
          </Button>
          <Button
            variant={activeTab === "results" ? "default" : "ghost"}
            size="sm"
            className="text-xs font-medium px-3 py-2 flex-1"
            onClick={() => setActiveTab("results")}
          >
            Results
          </Button>
        </div>
      </div>

      {/* Test Cases Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "test-cases" && (
          <div className="space-y-4">
            {testCases.map((testCase, index) => (
              <div key={index} className="bg-muted rounded-lg p-3 border-l-4 border-muted-foreground">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Test Case {index + 1}
                  </span>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="font-mono text-xs text-muted-foreground space-y-1">
                  <div>Input: {testCase.input}</div>
                  <div>Expected: {testCase.expected}</div>
                  <div className="text-muted-foreground">Pending...</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "output" && (
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Console Output</h3>
              <div className="font-mono text-xs">
                {compilationError ? (
                  <div className="text-red-600 dark:text-red-400">
                    <div className="font-semibold mb-1">Compilation Error:</div>
                    <pre className="whitespace-pre-wrap">{compilationError}</pre>
                  </div>
                ) : executionResult ? (
                  <div className="space-y-2">
                    {executionResult.results?.map((result: any, index: number) => (
                      <div key={index} className="border-l-2 border-blue-500 pl-3">
                        <div className="text-muted-foreground text-xs">Test Case {index + 1}:</div>
                        <div className="text-green-600 dark:text-green-400">
                          Input: {result.input}
                        </div>
                        <div className="text-blue-600 dark:text-blue-400">
                          Expected: {result.expected}
                        </div>
                        <div className={result.passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                          Output: {result.output}
                        </div>
                        <div className={result.passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                          {result.passed ? "✓ PASSED" : "✗ FAILED"}
                        </div>
                      </div>
                    ))}
                    <div className="mt-3 text-muted-foreground text-xs">
                      Runtime: {executionResult.runtime?.toFixed(2)}ms | 
                      Passed: {executionResult.passedCount}/{executionResult.totalCount}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    Click "Run Code" to see output
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "results" && (
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Submission Results</h3>
              {submitResult ? (
                <div className="space-y-3">
                  {submitResult.success ? (
                    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-semibold">{submitResult.message}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                      <XCircle className="h-4 w-4" />
                      <span className="font-semibold">Solution Incorrect</span>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {submitResult.results?.map((result: any, index: number) => (
                      <div key={index} className="border-l-2 border-blue-500 pl-3">
                        <div className="text-muted-foreground text-xs">Test Case {index + 1}{result.hidden ? " (Hidden)" : ""}:</div>
                        <div className="text-green-600 dark:text-green-400 text-xs">
                          Input: {result.input}
                        </div>
                        <div className="text-blue-600 dark:text-blue-400 text-xs">
                          Expected: {result.expected}
                        </div>
                        <div className={`text-xs ${result.passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                          Output: {result.output}
                        </div>
                        <div className={`font-semibold text-xs ${result.passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                          {result.passed ? "✓ PASSED" : "✗ FAILED"}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground bg-background rounded p-2">
                    <span>Score: {submitResult.passedCount}/{submitResult.totalCount}</span>
                    {submitResult.xpGained > 0 && (
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        +{submitResult.xpGained} XP
                      </span>
                    )}
                  </div>

                  {submitResult.newAchievements && submitResult.newAchievements.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-2">
                      <div className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                        🏆 Achievement Unlocked!
                      </div>
                      {submitResult.newAchievements.map((achievement: any, index: number) => (
                        <div key={index} className="text-xs text-yellow-700 dark:text-yellow-300">
                          {achievement.name}: {achievement.description}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="font-mono text-xs text-muted-foreground">
                  Submit your solution to see results
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

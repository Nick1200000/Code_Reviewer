export type LanguageOption = {
  value: string;
  label: string;
  extension: string;
};

export type ReviewTypeOption = {
  value: string;
  label: string;
  description: string;
};

export const programmingLanguages: LanguageOption[] = [
  { value: "Python", label: "Python", extension: ".py" },
  { value: "JavaScript", label: "JavaScript", extension: ".js" },
  { value: "TypeScript", label: "TypeScript", extension: ".ts" },
  { value: "Java", label: "Java", extension: ".java" },
  { value: "C++", label: "C++", extension: ".cpp" },
  { value: "Go", label: "Go", extension: ".go" },
  { value: "Ruby", label: "Ruby", extension: ".rb" },
  { value: "PHP", label: "PHP", extension: ".php" },
  { value: "C#", label: "C#", extension: ".cs" },
  { value: "Rust", label: "Rust", extension: ".rs" },
  { value: "Swift", label: "Swift", extension: ".swift" },
  { value: "Kotlin", label: "Kotlin", extension: ".kt" },
];

export const reviewTypes: ReviewTypeOption[] = [
  { 
    value: "Comprehensive", 
    label: "Comprehensive", 
    description: "Full analysis including style, performance, security, and best practices" 
  },
  { 
    value: "Syntax Only", 
    label: "Syntax Only", 
    description: "Focus on syntax errors and coding style issues" 
  },
  { 
    value: "Security Focus", 
    label: "Security Focus", 
    description: "Emphasize security vulnerabilities and secure coding practices" 
  },
  { 
    value: "Performance Focus", 
    label: "Performance Focus", 
    description: "Focus on performance optimizations and efficiency concerns" 
  },
];

export const sampleCode: Record<string, string> = {
  Python: `def calculate_average(numbers):
    total = 0
    count = 0
    
    for num in numbers:
        total = total + num
        count = count + 1
        
    if count == 0:
        print("Cannot calculate average of empty list")
        return None
    
    return total / count

# Test the function
test_list = [10, 20, 30, 40, 50]
print("Average:", calculate_average(test_list))

# This will cause an error
empty_list = []
print("Empty list average:", calculate_average(empty_list))`,

  JavaScript: `function calculateAverage(numbers) {
  var total = 0;
  var count = 0;
  
  for (var i = 0; i < numbers.length; i++) {
    total = total + numbers[i];
    count = count + 1;
  }
  
  if (count == 0) {
    console.log("Cannot calculate average of empty array");
    return null;
  }
  
  return total / count;
}

// Test the function
const testArray = [10, 20, 30, 40, 50];
console.log("Average:", calculateAverage(testArray));

// This will return null
const emptyArray = [];
console.log("Empty array average:", calculateAverage(emptyArray));`,

  Java: `public class AverageCalculator {
    public static double calculateAverage(int[] numbers) {
        int total = 0;
        int count = 0;
        
        for (int num : numbers) {
            total = total + num;
            count = count + 1;
        }
        
        if (count == 0) {
            System.out.println("Cannot calculate average of empty array");
            return -1; // Using -1 as error indicator
        }
        
        return (double) total / count;
    }
    
    public static void main(String[] args) {
        int[] testArray = {10, 20, 30, 40, 50};
        System.out.println("Average: " + calculateAverage(testArray));
        
        int[] emptyArray = {};
        System.out.println("Empty array average: " + calculateAverage(emptyArray));
    }
}`,
};

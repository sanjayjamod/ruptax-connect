import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, X, Delete } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const SideCalculator = () => {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);
  const [history, setHistory] = useState<string[]>([]);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (newNumber) {
      setDisplay("0.");
      setNewNumber(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const handleOperation = (op: string) => {
    if (previousValue && operation && !newNumber) {
      calculate();
    }
    setPreviousValue(display);
    setOperation(op);
    setNewNumber(true);
  };

  const calculate = () => {
    if (!previousValue || !operation) return;

    const prev = parseFloat(previousValue);
    const current = parseFloat(display);
    let result = 0;

    switch (operation) {
      case "+":
        result = prev + current;
        break;
      case "-":
        result = prev - current;
        break;
      case "×":
        result = prev * current;
        break;
      case "÷":
        result = current !== 0 ? prev / current : 0;
        break;
      case "%":
        result = (prev * current) / 100;
        break;
    }

    const historyEntry = `${prev} ${operation} ${current} = ${result}`;
    setHistory([historyEntry, ...history.slice(0, 9)]);
    
    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleClear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
      setNewNumber(true);
    }
  };

  const handleSquareRoot = () => {
    const value = parseFloat(display);
    if (value >= 0) {
      const result = Math.sqrt(value);
      setDisplay(String(result));
      setHistory([`√${value} = ${result}`, ...history.slice(0, 9)]);
      setNewNumber(true);
    }
  };

  const formatDisplay = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    if (value.includes(".") && !value.endsWith(".")) {
      return num.toLocaleString("en-IN", { maximumFractionDigits: 8 });
    }
    return num.toLocaleString("en-IN");
  };

  const CalcButton = ({ 
    children, 
    onClick, 
    className = "" 
  }: { 
    children: React.ReactNode; 
    onClick: () => void; 
    className?: string;
  }) => (
    <Button
      variant="outline"
      className={`h-12 text-lg font-medium ${className}`}
      onClick={onClick}
    >
      {children}
    </Button>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-40 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-green-600 hover:bg-green-700"
          size="icon"
          title="Calculator"
        >
          <Calculator className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[350px] sm:w-[400px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-green-600" />
            કેલ્ક્યુલેટર
          </SheetTitle>
        </SheetHeader>

        <div className="p-4 flex-1 flex flex-col">
          {/* Display */}
          <Card className="mb-4">
            <CardContent className="p-3">
              <div className="text-right">
                {previousValue && operation && (
                  <div className="text-sm text-muted-foreground mb-1">
                    {formatDisplay(previousValue)} {operation}
                  </div>
                )}
                <div className="text-3xl font-bold truncate">
                  {formatDisplay(display)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <CalcButton onClick={handleClear} className="bg-red-100 hover:bg-red-200 text-red-700">C</CalcButton>
            <CalcButton onClick={handleBackspace} className="bg-orange-100 hover:bg-orange-200 text-orange-700">
              <Delete className="h-5 w-5" />
            </CalcButton>
            <CalcButton onClick={handleSquareRoot} className="bg-blue-100 hover:bg-blue-200 text-blue-700">√</CalcButton>
            <CalcButton onClick={() => handleOperation("÷")} className="bg-primary/10 hover:bg-primary/20 text-primary">÷</CalcButton>

            <CalcButton onClick={() => handleNumber("7")}>7</CalcButton>
            <CalcButton onClick={() => handleNumber("8")}>8</CalcButton>
            <CalcButton onClick={() => handleNumber("9")}>9</CalcButton>
            <CalcButton onClick={() => handleOperation("×")} className="bg-primary/10 hover:bg-primary/20 text-primary">×</CalcButton>

            <CalcButton onClick={() => handleNumber("4")}>4</CalcButton>
            <CalcButton onClick={() => handleNumber("5")}>5</CalcButton>
            <CalcButton onClick={() => handleNumber("6")}>6</CalcButton>
            <CalcButton onClick={() => handleOperation("-")} className="bg-primary/10 hover:bg-primary/20 text-primary">−</CalcButton>

            <CalcButton onClick={() => handleNumber("1")}>1</CalcButton>
            <CalcButton onClick={() => handleNumber("2")}>2</CalcButton>
            <CalcButton onClick={() => handleNumber("3")}>3</CalcButton>
            <CalcButton onClick={() => handleOperation("+")} className="bg-primary/10 hover:bg-primary/20 text-primary">+</CalcButton>

            <CalcButton onClick={() => handleOperation("%")} className="bg-purple-100 hover:bg-purple-200 text-purple-700">%</CalcButton>
            <CalcButton onClick={() => handleNumber("0")}>0</CalcButton>
            <CalcButton onClick={handleDecimal}>.</CalcButton>
            <CalcButton onClick={calculate} className="bg-green-600 hover:bg-green-700 text-white">=</CalcButton>
          </div>

          {/* History */}
          {history.length > 0 && (
            <Card className="flex-1 overflow-hidden">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm">ઇતિહાસ</CardTitle>
              </CardHeader>
              <CardContent className="p-2 max-h-40 overflow-y-auto">
                {history.map((entry, i) => (
                  <div key={i} className="text-xs text-muted-foreground py-1 border-b last:border-0">
                    {entry}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SideCalculator;

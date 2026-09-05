import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("0");
  const [angleMode, setAngleMode] = useState("DEG");
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem("calculatorHistory");
    const savedTheme = localStorage.getItem("calculatorTheme");

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("calculatorHistory", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(
      "calculatorTheme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  // -------------------------
  // Angle conversion
  // -------------------------

  const toRadians = (value) => {
    if (angleMode === "DEG") {
      return (value * Math.PI) / 180;
    }

    if (angleMode === "GRAD") {
      return (value * Math.PI) / 200;
    }

    return value;
  };

  const fromRadians = (value) => {
    if (angleMode === "DEG") {
      return (value * 180) / Math.PI;
    }

    if (angleMode === "GRAD") {
      return (value * 200) / Math.PI;
    }

    return value;
  };

  // -------------------------
  // Format number
  // -------------------------

  const formatNumber = (number) => {
    if (!Number.isFinite(number)) {
      throw new Error("Math error");
    }

    if (Math.abs(number) < 1e-12) {
      return 0;
    }

    return Number(number.toPrecision(12));
  };

  // -------------------------
  // Factorial
  // -------------------------

  const factorial = (n) => {
    if (!Number.isFinite(n)) {
      throw new Error("Invalid number");
    }

    if (n < 0 || !Number.isInteger(n)) {
      throw new Error("Factorial requires a positive integer");
    }

    if (n > 170) {
      throw new Error("Number too large");
    }

    let value = 1;

    for (let i = 2; i <= n; i++) {
      value *= i;
    }

    return value;
  };

  // -------------------------
  // Evaluate expression
  // -------------------------

  const evaluateExpression = (exp) => {
    let safeExpression = exp.replace(/\^/g, "**");

    if (!/^[0-9+\-*/().\s*]+$/.test(safeExpression)) {
      throw new Error("Invalid expression");
    }

    const value = Function(
      `"use strict"; return (${safeExpression})`
    )();

    if (!Number.isFinite(value)) {
      throw new Error("Math error");
    }

    return value;
  };

  // -------------------------
  // Current value
  // -------------------------

  const getCurrentValue = () => {
    if (!expression) {
      return 0;
    }

    return evaluateExpression(expression);
  };

  // -------------------------
  // Append
  // -------------------------

  const append = (value) => {
    if (result === "Error") {
      setResult("0");
      setExpression("");
    }

    setExpression((prev) => {
      let current = prev;

      // Decimal validation
      if (value === ".") {
        const parts = current.split(/[+\-*/^()]/);
        const lastPart = parts[parts.length - 1];

        if (lastPart.includes(".")) {
          return current;
        }
      }

      // Automatic multiplication
      if (value === "(") {
        if (current && /[\d)]$/.test(current)) {
          current += "*";
        }
      }

      // Closing bracket validation
      if (value === ")") {
        const open =
          (current.match(/\(/g) || []).length;

        const close =
          (current.match(/\)/g) || []).length;

        if (
          open <= close ||
          !current ||
          /[+\-*/^(]$/.test(current)
        ) {
          return current;
        }
      }

      // Operators
      if (["+", "-", "*", "/"].includes(value)) {
        if (!current && value !== "-") {
          return current;
        }

        if (/[+\-*/^]$/.test(current)) {
          return current.slice(0, -1) + value;
        }
      }

      return current + value;
    });
  };

  // -------------------------
  // Calculate
  // -------------------------

  const calculate = () => {
    if (!expression) return;

    try {
      let exp = expression;

      const open =
        (exp.match(/\(/g) || []).length;

      const close =
        (exp.match(/\)/g) || []).length;

      if (open !== close) {
        throw new Error("Check parentheses");
      }

      if (/[+\-*/^]$/.test(exp)) {
        exp = exp.slice(0, -1);
      }

      const value = evaluateExpression(exp);
      const formatted = formatNumber(value);

      addHistory(exp, formatted);

      setResult(String(formatted));
      setExpression("");
    } catch (error) {
      setResult("Error");
    }
  };

  // -------------------------
  // Scientific function
  // -------------------------

  const scientific = (type) => {
    try {
      const value = getCurrentValue();

      let output;

      switch (type) {
        case "sin":
          output = Math.sin(toRadians(value));
          break;

        case "cos":
          output = Math.cos(toRadians(value));
          break;

        case "tan": {
          const radians = toRadians(value);

          if (Math.abs(Math.cos(radians)) < 1e-12) {
            throw new Error("Undefined");
          }

          output = Math.tan(radians);
          break;
        }

        case "asin":
          if (value < -1 || value > 1) {
            throw new Error("Domain error");
          }

          output = fromRadians(Math.asin(value));
          break;

        case "acos":
          if (value < -1 || value > 1) {
            throw new Error("Domain error");
          }

          output = fromRadians(Math.acos(value));
          break;

        case "atan":
          output = fromRadians(Math.atan(value));
          break;

        case "sinh":
          output = Math.sinh(value);
          break;

        case "cosh":
          output = Math.cosh(value);
          break;

        case "tanh":
          output = Math.tanh(value);
          break;

        case "asinh":
          output = Math.asinh(value);
          break;

        case "acosh":
          if (value < 1) {
            throw new Error("Domain error");
          }

          output = Math.acosh(value);
          break;

        case "atanh":
          if (value <= -1 || value >= 1) {
            throw new Error("Domain error");
          }

          output = Math.atanh(value);
          break;

        case "log":
          if (value <= 0) {
            throw new Error("Domain error");
          }

          output = Math.log10(value);
          break;

        case "ln":
          if (value <= 0) {
            throw new Error("Domain error");
          }

          output = Math.log(value);
          break;

        case "sqrt":
          if (value < 0) {
            throw new Error("Domain error");
          }

          output = Math.sqrt(value);
          break;

        case "cbrt":
          output = Math.cbrt(value);
          break;

        case "square":
          output = value ** 2;
          break;

        case "cube":
          output = value ** 3;
          break;

        case "power10":
          output = 10 ** value;
          break;

        case "exp":
          output = Math.exp(value);
          break;

        case "factorial":
          output = factorial(value);
          break;

        case "reciprocal":
          if (value === 0) {
            throw new Error("Cannot divide by zero");
          }

          output = 1 / value;
          break;

        case "abs":
          output = Math.abs(value);
          break;

        case "floor":
          output = Math.floor(value);
          break;

        case "ceil":
          output = Math.ceil(value);
          break;

        case "negate":
          output = -value;
          break;

        default:
          return;
      }

      output = formatNumber(output);

      setResult(String(output));
      setExpression("");
    } catch (error) {
      setResult("Error");
    }
  };

  // -------------------------
  // Constants
  // -------------------------

  const insertConstant = (type) => {
    const value = type === "pi" ? Math.PI : Math.E;

    setExpression((prev) => {
      if (prev && /[\d)]$/.test(prev)) {
        return prev + "*" + value;
      }

      return prev + value;
    });

    setResult("0");
  };

  // -------------------------
  // Power
  // -------------------------

  const insertPower = () => {
    if (!expression) return;

    if (/[+\-*/^]$/.test(expression)) return;

    setExpression((prev) => prev + "^");
  };

  // -------------------------
  // Percentage
  // -------------------------

  const percentage = () => {
    try {
      const value = getCurrentValue();
      const output = formatNumber(value / 100);

      setResult(String(output));
      setExpression("");
    } catch {
      setResult("Error");
    }
  };

  // -------------------------
  // Modulo
  // -------------------------

  const modulo = () => {
    try {
      const first = getCurrentValue();

      const second = window.prompt(
        "Enter second number:"
      );

      if (second === null) return;

      const secondNumber = Number(second);

      if (
        !Number.isFinite(secondNumber) ||
        secondNumber === 0
      ) {
        throw new Error("Invalid modulo value");
      }

      const output = formatNumber(
        first % secondNumber
      );

      addHistory(
        `${first} mod ${secondNumber}`,
        output
      );

      setResult(String(output));
      setExpression("");
    } catch {
      setResult("Error");
    }
  };

  // -------------------------
  // Backspace
  // -------------------------

  const backspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  // -------------------------
  // Clear
  // -------------------------

  const clearCalculator = () => {
    setExpression("");
    setResult("0");
  };

  // -------------------------
  // History
  // -------------------------

  const addHistory = (exp, res) => {
    const item = {
      expression: exp,
      result: res,
    };

    setHistory((prev) => [item, ...prev].slice(0, 20));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const useHistory = (item) => {
    setExpression("");
    setResult(String(item.result));
  };

  // -------------------------
  // Copy
  // -------------------------

  const copyResult = async () => {
    if (result === "Error") return;

    try {
      await navigator.clipboard.writeText(result);
      alert("Result copied!");
    } catch {
      const textarea =
        document.createElement("textarea");

      textarea.value = result;
      document.body.appendChild(textarea);
      textarea.select();

      document.execCommand("copy");

      document.body.removeChild(textarea);

      alert("Result copied!");
    }
  };

  // -------------------------
  // Keyboard
  // -------------------------

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key;

      if (/^[0-9.]$/.test(key)) {
        append(key);
      }

      else if (
        ["+", "-", "*", "/"].includes(key)
      ) {
        append(key);
      }

      else if (
        key === "(" ||
        key === ")"
      ) {
        append(key);
      }

      else if (key === "^") {
        insertPower();
      }

      else if (
        key === "Enter" ||
        key === "="
      ) {
        calculate();
      }

      else if (key === "Backspace") {
        backspace();
      }

      else if (key === "Escape") {
        clearCalculator();
      }

      else if (key === "%") {
        percentage();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  });

  return (
    <div className={darkMode ? "app dark" : "app"}>

      <div className="calculator">

        {/* Header */}

        <div className="header">

          <div>
            <h1>Scientific Calculator</h1>
            <p>Advanced Mathematical Calculator</p>
          </div>

          <button
            className="theme-btn"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

        </div>

        {/* Display */}

        <div className="display-box">

          <div className="display-top">

            <div className="angle-buttons">

              {["DEG", "RAD", "GRAD"].map(
                (mode) => (
                  <button
                    key={mode}
                    className={
                      angleMode === mode
                        ? "mode active"
                        : "mode"
                    }
                    onClick={() =>
                      setAngleMode(mode)
                    }
                  >
                    {mode}
                  </button>
                )
              )}

            </div>

            <button
              className="copy-btn"
              onClick={copyResult}
            >
              📋 Copy
            </button>

          </div>

          <div className="expression">
            {expression
              .replace(/\*/g, "×")
              .replace(/\//g, "÷")}
          </div>

          <div className="result">
            {expression
              ? expression
                  .replace(/\*/g, "×")
                  .replace(/\//g, "÷")
              : result}
          </div>

        </div>

        {/* Main calculator */}

        <div className="calculator-grid">

          {/* Scientific */}

          <div className="scientific">

            <button onClick={() => scientific("sin")}>
              sin
            </button>

            <button onClick={() => scientific("cos")}>
              cos
            </button>

            <button onClick={() => scientific("tan")}>
              tan
            </button>

            <button onClick={() => scientific("asin")}>
              sin⁻¹
            </button>

            <button onClick={() => scientific("acos")}>
              cos⁻¹
            </button>

            <button onClick={() => scientific("atan")}>
              tan⁻¹
            </button>

            <button onClick={() => scientific("sinh")}>
              sinh
            </button>

            <button onClick={() => scientific("cosh")}>
              cosh
            </button>

            <button onClick={() => scientific("tanh")}>
              tanh
            </button>

            <button onClick={() => scientific("asinh")}>
              sinh⁻¹
            </button>

            <button onClick={() => scientific("acosh")}>
              cosh⁻¹
            </button>

            <button onClick={() => scientific("atanh")}>
              tanh⁻¹
            </button>

            <button onClick={() => scientific("log")}>
              log
            </button>

            <button onClick={() => scientific("ln")}>
              ln
            </button>

            <button onClick={() => scientific("sqrt")}>
              √
            </button>

            <button onClick={() => scientific("cbrt")}>
              ∛
            </button>

            <button onClick={() => scientific("square")}>
              x²
            </button>

            <button onClick={() => scientific("cube")}>
              x³
            </button>

            <button onClick={() => scientific("power10")}>
              10ˣ
            </button>

            <button onClick={() => scientific("exp")}>
              eˣ
            </button>

            <button onClick={() => scientific("factorial")}>
              x!
            </button>

            <button onClick={() => scientific("reciprocal")}>
              1/x
            </button>

            <button onClick={() => scientific("abs")}>
              |x|
            </button>

            <button onClick={() => scientific("negate")}>
              ±
            </button>

            <button onClick={() => scientific("floor")}>
              floor
            </button>

            <button onClick={() => scientific("ceil")}>
              ceil
            </button>

            <button onClick={() => insertConstant("pi")}>
              π
            </button>

            <button onClick={() => insertConstant("e")}>
              e
            </button>

            <button onClick={insertPower}>
              xʸ
            </button>

            <button onClick={modulo}>
              mod
            </button>

          </div>

          {/* Basic */}

          <div className="basic">

            <button
              className="danger"
              onClick={clearCalculator}
            >
              AC
            </button>

            <button onClick={backspace}>
              ⌫
            </button>

            <button onClick={() => append("(")}>
              (
            </button>

            <button onClick={() => append(")")}>
              )
            </button>

            <button onClick={() => append("7")}>
              7
            </button>

            <button onClick={() => append("8")}>
              8
            </button>

            <button onClick={() => append("9")}>
              9
            </button>

            <button
              className="operator"
              onClick={() => append("/")}
            >
              ÷
            </button>

            <button onClick={() => append("4")}>
              4
            </button>

            <button onClick={() => append("5")}>
              5
            </button>

            <button onClick={() => append("6")}>
              6
            </button>

            <button
              className="operator"
              onClick={() => append("*")}
            >
              ×
            </button>

            <button onClick={() => append("1")}>
              1
            </button>

            <button onClick={() => append("2")}>
              2
            </button>

            <button onClick={() => append("3")}>
              3
            </button>

            <button
              className="operator"
              onClick={() => append("-")}
            >
              −
            </button>

            <button onClick={() => append("0")}>
              0
            </button>

            <button onClick={() => append(".")}>
              .
            </button>

            <button
              className="operator"
              onClick={() => append("+")}
            >
              +
            </button>

            <button
              className="equals"
              onClick={calculate}
            >
              =
            </button>

            <button
              className="percentage"
              onClick={percentage}
            >
              %
            </button>

          </div>

        </div>

        {/* History */}

        <div className="history">

          <div className="history-header">

            <h2>Calculation History</h2>

            <button
              onClick={clearHistory}
              className="clear-history"
            >
              Clear
            </button>

          </div>

          {history.length === 0 ? (
            <p className="empty">
              No calculations yet
            </p>
          ) : (
            <div className="history-list">

              {history.map((item, index) => (
                <div
                  className="history-item"
                  key={index}
                  onClick={() => useHistory(item)}
                >
                  <span>
                    {item.expression}
                  </span>

                  <strong>
                    = {item.result}
                  </strong>
                </div>
              ))}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default App;
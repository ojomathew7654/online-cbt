import { useState } from "react";
import * as math from "mathjs";

function Calculator() {
  const [expression, setExpression] = useState("");
  const [screenVal, setScreenVal] = useState("");

  const customVariables = {};

  function handleChange(e) {
    setExpression(e.target.value);
  }

  function handleClick(input) {
    setExpression((prevExpression) => prevExpression + input);
  }

  function calculate() {
    try {
      const allVariables = {
        ...customVariables,
        pi: Math.PI,
        e: Math.E,
        fact: math.factorial,
      };

      const result = math.evaluate(expression, allVariables);

      if (typeof result === "number" && !isNaN(result)) {
        setScreenVal(Number(result));
      } else {
        setScreenVal("Error: Invalid expression");
      }
    } catch (error) {
      setScreenVal("Error: Invalid expression");
    }
  }

  function clearScreen() {
    setExpression("");
    setScreenVal("");
  }

  function backspace() {
    const newExpression = expression.slice(0, -1);
    setExpression(newExpression);
  }

  const operators = ["^", "-", "/", "sqrt(", "+", "*", "(", ")"];

  return (
    <div
      className="
        w-[250px]
        h-[370px]
        mx-auto
        mt-[30px]
        p-5
        bg-bg-deep
        rounded-[10px]
        shadow-[0_4px_10px_rgba(0,0,0,0.6)]
        fixed
        top-[180px]
        right-[5%]
        z-20
      "
    >
      {/* Calculator body */}
      <div>
        {/* Screen */}
        <div className="w-full">
          <input
            className="
              w-full
              h-[50px]
              text-[20px]
              text-right
              text-black
              bg-white
              border-0
              outline-none
              px-[10px]
              mb-[10px]
              rounded-[5px]
            "
            type="text"
            value={expression}
            onChange={handleChange}
          />

          <div
            className="
              w-full
              h-[30px]
              overflow-x-hidden
              bg-white
              text-black
              font-bold
              text-[15px]
              mb-[5px]
              rounded-[5px]
              px-2
              flex
              items-center
            "
          >
            Result: {screenVal}
          </div>
        </div>

        {/* Operators */}
        <div
          className="
            w-full
            h-[120px]
            grid
            grid-cols-3
            gap-1
            mb-[5px]
          "
        >
          {operators.map((input) => {
            const isOperator = ["+", "*", "-", "/"].includes(input);

            return (
              <button
                key={input}
                type="button"
                onClick={() => handleClick(input)}
                className={`
                  font-bold
                  rounded-[5px]
                  transition
                  active:translate-y-[2px]
                  ${
                    isOperator
                      ? "bg-yellow-300 text-black"
                      : "bg-black text-white"
                  }
                `}
              >
                {input}
              </button>
            );
          })}

          {/* Pi */}
          <button
            type="button"
            onClick={() => handleClick("pi")}
            className="
              bg-black
              text-white
              font-bold
              rounded-[5px]
              transition
              active:translate-y-[2px]
            "
          >
            Pi
          </button>

          {/* Factorial */}
          <button
            type="button"
            onClick={() => handleClick("fact(")}
            className="
              bg-black
              text-white
              font-bold
              rounded-[5px]
              transition
              active:translate-y-[2px]
            "
          >
            Factorial
          </button>

          {/* Clear */}
          <button
            type="button"
            onClick={clearScreen}
            className="
              bg-crimson-600
              bg-red-600
              text-white
              font-bold
              rounded-[5px]
              transition
              active:translate-y-[2px]
            "
          >
            C
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={backspace}
            className="
              bg-red-600
              text-white
              font-bold
              rounded-[5px]
              transition
              active:translate-y-[2px]
            "
          >
            del
          </button>
        </div>

        {/* Number pad */}
        <div
          className="
            h-[120px]
            grid
            grid-cols-3
            gap-[5px]
            mb-1
            font-bold
          "
        >
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((input) => (
            <button
              key={input}
              type="button"
              onClick={() => handleClick(input)}
              className="
                  bg-white
                  text-black
                  rounded-[2px]
                  font-bold
                  transition
                  active:translate-y-[2px]
                  active:bg-[#946a6a]
                "
            >
              {input}
            </button>
          ))}

          {/* Decimal */}
          <button
            type="button"
            onClick={() => handleClick(".")}
            className="
              bg-white
              text-black
              rounded-[2px]
              font-bold
              transition
              active:translate-y-[2px]
              active:bg-[#946a6a]
            "
          >
            ,
          </button>

          {/* Equals */}
          <button
            type="button"
            onClick={calculate}
            className="
              bg-primary
              text-black
              rounded-[2px]
              font-bold
              transition
              active:translate-y-[2px]
            "
          >
            =
          </button>
        </div>
      </div>

      {/* Kept because it existed in the original structure */}
      <div className="hidden" />
    </div>
  );
}

export default Calculator;

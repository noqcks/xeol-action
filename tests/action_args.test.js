const { run } = require("../index");
const core = require("@actions/core");
const exec = require("@actions/exec");

jest.setTimeout(30000);

describe("Github action args", () => {
  it("runs with json output", async () => {
    const inputs = {
      image: "",
      path: "tests/fixtures/npm-project",
      "fail-build": "true",
      "output-format": "json",
    };
    const spyInput = jest.spyOn(core, "getInput").mockImplementation((name) => {
      try {
        return inputs[name];
      } finally {
        inputs[name] = true;
      }
    });

    const outputs = {};
    const spyOutput = jest
      .spyOn(core, "setOutput")
      .mockImplementation((name, value) => {
        outputs[name] = value;
      });

    await run();

    Object.keys(inputs).map((name) => {
      expect(inputs[name]).toBe(true);
    });

    spyInput.mockRestore();
    spyOutput.mockRestore();
  });

  it("runs with table output", async () => {
    const inputs = {
      image: "localhost:5000/match-coverage/mongo-32:latest",
      "fail-build": "true",
      "output-format": "table",
    };
    const spyInput = jest.spyOn(core, "getInput").mockImplementation((name) => {
      try {
        return inputs[name];
      } finally {
        inputs[name] = true;
      }
    });

    const outputs = {};
    const spyOutput = jest
      .spyOn(core, "setOutput")
      .mockImplementation((name, value) => {
        outputs[name] = value;
      });

    let stdout = "";
    const spyStdout = jest.spyOn(core, "info").mockImplementation((value) => {
      stdout += value;
    });

    await run();

    Object.keys(inputs).map((name) => {
      expect(inputs[name]).toBe(true);
    });

    expect(stdout).toContain("EOL");

    expect(outputs["json"]).toBeFalsy();

    spyInput.mockRestore();
    spyOutput.mockRestore();
    spyStdout.mockRestore();
  });

  it("runs with environment variables", async () => {
    const inputs = {
      path: "tests/fixtures/npm-project",
    };
    const spyInput = jest.spyOn(core, "getInput").mockImplementation((name) => {
      try {
        return inputs[name];
      } finally {
        inputs[name] = true;
      }
    });
    process.env.BOGUS_ENVIRONMENT_VARIABLE = "bogus";

    try {
      var call = {}; // commandLine, args, options
      const baseExec = exec.exec;
      const spyExec = jest
        .spyOn(exec, "exec")
        .mockImplementation((commandLine, args, options) => {
          call = {
            commandLine,
            args,
            options,
          };
          return baseExec(commandLine, args, options);
        });

      await run();

      expect(call.options).toBeDefined();
      expect(call.options.env.BOGUS_ENVIRONMENT_VARIABLE).toEqual("bogus");

      spyExec.mockRestore();
    } finally {
      delete process.env.BOGUS_ENVIRONMENT_VARIABLE;
    }

    spyInput.mockRestore();
  });
});

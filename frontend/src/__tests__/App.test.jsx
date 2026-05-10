/**
 * Jest + React Testing Library tests for the App component.
 *
 * These tests treat the component as a black box and verify observable
 * behaviour: what the user sees and what happens when they interact.
 *
 * Required packages (add to package.json devDependencies when scaffolding):
 *   @testing-library/react
 *   @testing-library/jest-dom
 *   @testing-library/user-event
 *   jest-environment-jsdom
 *
 * jest.config.js (or package.json jest field) must set:
 *   testEnvironment: "jsdom"
 *
 * The App component is expected to:
 *   - Render a file <input type="file"> that accepts images
 *   - Render a submit / predict button
 *   - Call POST /predict with a FormData body when submitted
 *   - Show a loading indicator while the request is in flight
 *   - Display 3 predictions (label + probability) on success
 *   - Display an error message when the request fails
 */

import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import App from "../App";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MOCK_PREDICTIONS = [
  { label: "tabby", probability: 0.8521 },
  { label: "tiger_cat", probability: 0.0932 },
  { label: "Egyptian_cat", probability: 0.0312 },
];

function mockFetchSuccess() {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ predictions: MOCK_PREDICTIONS }),
  });
}

function mockFetchFailure(status = 500) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => ({ error: "Internal server error" }),
  });
}

function mockFetchNetworkError() {
  global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));
}

function makeImageFile(name = "cat.jpg") {
  return new File(["(binary image data)"], name, { type: "image/jpeg" });
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("Initial render", () => {
  test("renders without crashing", () => {
    render(<App />);
  });

  test("renders a file upload input", () => {
    render(<App />);
    const input = document.querySelector("input[type='file']");
    expect(input).toBeInTheDocument();
  });

  test("file input accepts image files", () => {
    render(<App />);
    const input = document.querySelector("input[type='file']");
    expect(input).toHaveAttribute("accept");
    expect(input.getAttribute("accept")).toMatch(/image/);
  });

  test("renders a predict / submit button", () => {
    render(<App />);
    const button = screen.getByRole("button", { name: /predict|classify|submit|upload/i });
    expect(button).toBeInTheDocument();
  });

  test("does not show predictions on initial render", () => {
    render(<App />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// File selection
// ---------------------------------------------------------------------------

describe("File selection", () => {
  test("user can select an image file", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = document.querySelector("input[type='file']");
    const file = makeImageFile();
    await user.upload(input, file);
    expect(input.files[0]).toBe(file);
    expect(input.files).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Successful prediction
// ---------------------------------------------------------------------------

describe("Successful prediction flow", () => {
  test("calls fetch with POST /predict when submitted", async () => {
    mockFetchSuccess();
    const user = userEvent.setup();
    render(<App />);

    const input = document.querySelector("input[type='file']");
    await user.upload(input, makeImageFile());
    await user.click(screen.getByRole("button", { name: /predict|classify|submit|upload/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toMatch(/predict/);
    expect(options.method.toUpperCase()).toBe("POST");
  });

  test("sends the image as FormData", async () => {
    mockFetchSuccess();
    const user = userEvent.setup();
    render(<App />);

    await user.upload(document.querySelector("input[type='file']"), makeImageFile());
    await user.click(screen.getByRole("button", { name: /predict|classify|submit|upload/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    const body = global.fetch.mock.calls[0][1].body;
    expect(body).toBeInstanceOf(FormData);
  });

  test("displays exactly 3 predictions after a successful response", async () => {
    mockFetchSuccess();
    const user = userEvent.setup();
    render(<App />);

    await user.upload(document.querySelector("input[type='file']"), makeImageFile());
    await user.click(screen.getByRole("button", { name: /predict|classify|submit|upload/i }));

    await waitFor(() => {
      const items = screen.getAllByRole("listitem");
      expect(items).toHaveLength(3);
    });
  });

  test("displays each prediction label", async () => {
    mockFetchSuccess();
    const user = userEvent.setup();
    render(<App />);

    await user.upload(document.querySelector("input[type='file']"), makeImageFile());
    await user.click(screen.getByRole("button", { name: /predict|classify|submit|upload/i }));

    for (const pred of MOCK_PREDICTIONS) {
      await waitFor(() =>
        expect(screen.getByText(new RegExp(pred.label, "i"))).toBeInTheDocument()
      );
    }
  });

  test("displays each prediction probability", async () => {
    mockFetchSuccess();
    const user = userEvent.setup();
    render(<App />);

    await user.upload(document.querySelector("input[type='file']"), makeImageFile());
    await user.click(screen.getByRole("button", { name: /predict|classify|submit|upload/i }));

    for (const pred of MOCK_PREDICTIONS) {
      await waitFor(() =>
        expect(
          screen.getByText(new RegExp(String(pred.probability)))
        ).toBeInTheDocument()
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

describe("Loading state", () => {
  test("shows a loading indicator while the request is in flight", async () => {
    // Never resolves so we can inspect the in-flight state
    global.fetch = jest.fn(() => new Promise(() => {}));
    const user = userEvent.setup();
    render(<App />);

    await user.upload(document.querySelector("input[type='file']"), makeImageFile());
    await user.click(screen.getByRole("button", { name: /predict|classify|submit|upload/i }));

    // Loading indicator can be any element — we look for common patterns
    const loading =
      screen.queryByRole("status") ||
      screen.queryByText(/loading|classifying|predicting/i) ||
      screen.queryByLabelText(/loading/i);

    expect(loading).toBeInTheDocument();
  });

  test("loading indicator disappears after response arrives", async () => {
    mockFetchSuccess();
    const user = userEvent.setup();
    render(<App />);

    await user.upload(document.querySelector("input[type='file']"), makeImageFile());
    await user.click(screen.getByRole("button", { name: /predict|classify|submit|upload/i }));

    await waitFor(() => {
      const loading =
        screen.queryByRole("status") ||
        screen.queryByText(/loading|classifying|predicting/i);
      expect(loading).not.toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

describe("Error handling", () => {
  test("shows an error message when the server returns a non-ok response", async () => {
    mockFetchFailure(500);
    const user = userEvent.setup();
    render(<App />);

    await user.upload(document.querySelector("input[type='file']"), makeImageFile());
    await user.click(screen.getByRole("button", { name: /predict|classify|submit|upload/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toBeInTheDocument()
    );
  });

  test("shows an error message on network failure", async () => {
    mockFetchNetworkError();
    const user = userEvent.setup();
    render(<App />);

    await user.upload(document.querySelector("input[type='file']"), makeImageFile());
    await user.click(screen.getByRole("button", { name: /predict|classify|submit|upload/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toBeInTheDocument()
    );
  });

  test("does not show predictions when an error occurs", async () => {
    mockFetchFailure();
    const user = userEvent.setup();
    render(<App />);

    await user.upload(document.querySelector("input[type='file']"), makeImageFile());
    await user.click(screen.getByRole("button", { name: /predict|classify|submit|upload/i }));

    await waitFor(() => screen.getByRole("alert"));
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});

import { InfrastructureError } from "../../src/InfrastructureError";

test("should identify itself as an InfrastructureError", () => {
    const error = new InfrastructureError("Database error");

    expect(error.name).toBe("InfrastructureError");
});

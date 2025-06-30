import { Link } from "@tanstack/react-router";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function Home() {
  const drawingId = generateId();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <h1>Multi-User Excalidraw</h1>
      <Link to="/excalidraw/$id" params={{ id: drawingId }}>
        <button>Create New Drawing</button>
      </Link>
    </div>
  );
}

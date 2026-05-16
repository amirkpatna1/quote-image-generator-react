export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="toast show">
      <span className="toast-dot" />
      {message}
    </div>
  );
}

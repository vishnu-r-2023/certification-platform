function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="status-card">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  );
}

export default LoadingSpinner;

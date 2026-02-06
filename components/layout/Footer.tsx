export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer mt-auto py-3 text-center">
      <div className="container">
        <span className="text-muted">
          Copyright © <span id="year">{currentYear}</span>{' '}
          <a href="#" className="text-dark fw-medium">
            Vyzor
          </a>
          . Designed with <span className="bi bi-heart-fill text-danger"></span> by{' '}
          <a href="https://spruko.com/" target="_blank" rel="noopener noreferrer">
            <span className="fw-medium text-primary">Spruko</span>
          </a>{' '}
          All rights reserved
        </span>
      </div>
    </footer>
  );
}
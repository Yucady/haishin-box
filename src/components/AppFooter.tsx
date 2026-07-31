function AppFooter() {
  return (
    <footer className="app-footer">
      <p>
        入力内容はこのブラウザ内に保存されます。
      </p>

      <div className="app-footer-meta">
        <span>
          配信準備BOX v{__APP_VERSION__}
        </span>

        <span aria-hidden="true">·</span>

        <a
          href="https://github.com/Yucady/haishin-box"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHubでソースコードを見る"
        >
          GitHub
        </a>
      </div>
    </footer>
  )
}

export default AppFooter
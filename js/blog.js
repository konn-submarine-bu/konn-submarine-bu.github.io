// ===== 墨 · Ink Blog =====

const POSTS_DIR = 'posts/';
const POSTS_INDEX = POSTS_DIR + 'index.json';

// ===== Router =====

function route() {
  const hash = window.location.hash;
  const homeEl = document.getElementById('home');
  const postEl = document.getElementById('post');
  const aboutEl = document.getElementById('about');

  homeEl.style.display = 'none';
  postEl.style.display = 'none';
  aboutEl.style.display = 'none';

  if (!hash || hash === '#/') {
    homeEl.style.display = 'block';
    loadPostList();
  } else if (hash === '#about') {
    aboutEl.style.display = 'block';
    loadAbout();
  } else if (hash.startsWith('#/post/')) {
    const slug = hash.replace('#/post/', '');
    postEl.style.display = 'block';
    loadPost(slug);
  } else {
    homeEl.style.display = 'block';
    loadPostList();
  }

  window.scrollTo({ top: 0, behavior: 'instant' });
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  route();
});

// ===== Load Post List =====

async function loadPostList() {
  const container = document.getElementById('post-list');

  try {
    const resp = await fetch(POSTS_INDEX);
    if (!resp.ok) throw new Error('Failed to load index');

    const posts = await resp.json();

    if (!posts || posts.length === 0) {
      container.innerHTML = '<p class="empty-message">尚无文章，静待笔墨。</p>';
      return;
    }

    container.innerHTML = posts.map(post => `
      <a href="#/post/${post.slug}" class="post-card">
        <h3 class="post-card-title">${escapeHtml(post.title)}</h3>
        <span class="post-card-date">${formatDate(post.date)}</span>
        ${post.excerpt ? `<p class="post-card-excerpt">${escapeHtml(post.excerpt)}</p>` : ''}
        ${post.tags && post.tags.length > 0 ? `
          <div class="post-tags">
            ${post.tags.map(t => `<span class="post-tag">${escapeHtml(t)}</span>`).join('')}
          </div>
        ` : ''}
      </a>
    `).join('');

  } catch (err) {
    container.innerHTML = '<p class="empty-message">暂无文章索引。<br>请创建 <code>posts/index.json</code> 文件。</p>';
  }
}

// ===== Load Single Post =====

async function loadPost(slug) {
  const container = document.getElementById('post-content');

  try {
    const resp = await fetch(POSTS_DIR + slug + '.md');
    if (!resp.ok) throw new Error('Post not found');

    const md = await resp.text();
    const { frontMatter, content } = parseFrontMatter(md);

    document.title = frontMatter.title
      ? `${frontMatter.title} · 墨`
      : '墨 · Ink';

    let html = '<a href="#/" class="post-back">返回</a>';

    if (frontMatter.title) {
      html += `<h1>${escapeHtml(frontMatter.title)}</h1>`;
    }

    if (frontMatter.date || frontMatter.author) {
      html += '<div class="post-meta">';
      if (frontMatter.date) {
        html += `<time>${formatDate(frontMatter.date)}</time>`;
      }
      if (frontMatter.author) {
        html += `<span>${escapeHtml(frontMatter.author)}</span>`;
      }
      html += '</div>';
    }

    if (frontMatter.tags && frontMatter.tags.length > 0) {
      html += '<div class="post-tags" style="margin-bottom:16px">';
      html += frontMatter.tags.map(t => `<span class="post-tag">${escapeHtml(t)}</span>`).join('');
      html += '</div>';
    }

    html += marked.parse(content);
    container.innerHTML = html;

    container.querySelectorAll('img').forEach(img => {
      img.loading = 'lazy';
    });

  } catch (err) {
    container.innerHTML = `
      <a href="#/" class="post-back">返回</a>
      <p class="empty-message">文章未找到。</p>
    `;
  }
}

// ===== Load About =====

async function loadAbout() {
  const container = document.getElementById('about-content');
  document.title = '关于 · 墨';

  try {
    const resp = await fetch('posts/about.md');
    if (!resp.ok) throw new Error('About not found');

    const md = await resp.text();
    const { content } = parseFrontMatter(md);

    container.innerHTML = marked.parse(content);
  } catch (err) {
    container.innerHTML = `
      <h1>关于</h1>
      <p>此处暂无内容。</p>
    `;
  }
}

// ===== Front Matter Parser =====

function parseFrontMatter(md) {
  const frontMatter = {};
  let content = md;

  const match = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (match) {
    const fm = match[1];
    content = match[2];

    fm.split('\n').forEach(line => {
      const kv = line.match(/^(\w+):\s*(.*)$/);
      if (kv) {
        let key = kv[1].trim();
        let val = kv[2].trim();

        if (val.startsWith('[') && val.endsWith(']')) {
          frontMatter[key] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
        } else {
          frontMatter[key] = val.replace(/^['"]|['"]$/g, '');
        }
      }
    });
  }

  return { frontMatter, content };
}

// ===== Utilities =====

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Clematis Explained',
  tagline: 'Documentation, Recipe Book and Blog',
  favicon: 'img/clematis_small.svg',

  // Set the production url of your site here
  url: 'https://clematis.github.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'grauds', // Usually your GitHub org/user name.
  projectName: 'clematis.doc', // Usually your repo name.
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },

  themes: [
    '@docusaurus/theme-mermaid',
    '@docusaurus/theme-search-algolia'
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts'
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/clematis_small.svg',
    navbar: {
      title: 'Clematis Explained',
      logo: {
        alt: 'Clematis Docs Logo',
        src: 'img/clematis_small.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'right',
          label: 'Documentation',
        },
        {
          to: '/blog',
          label: 'Blog',
          position: 'right'
        },
        {
          href: 'https://github.com/grauds',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Web Applications',
              to: '/docs/web-applications/overview',
            },
            {
              label: 'Recipe Book',
              to: '/docs/recipe-book/react/props-and-state',
            },
          ],
        },
        {
          title: 'All Projects',
          items: [
            {
              label: 'Clematis Auth API',
              href: 'https://github.com/grauds/clematis.auth.api',
            },
            {
              label: 'Clematis Storage API',
              href: 'https://github.com/grauds/clematis.storage.api',
            },
            {
              label: 'Clematis Weather API',
              href: 'https://github.com/grauds/clematis.weather.api',
            },
            {
              label: 'Money Tracker UI',
              href: 'https://github.com/grauds/money.tracker.ui',
            },
            {
              label: 'Money Tracker API',
              href: 'https://github.com/grauds/money.tracker.api',
            },
            {
              label: 'Pomodoro',
              href: 'https://github.com/grauds/clematis.poc.pomodoro',
            },
            {
              label: 'Cosmic UI',
              href: 'https://github.com/grauds/clematis.cosmic.ui',
            },
            {
              label: 'Cosmic API',
              href: 'https://github.com/grauds/clematis.cosmic',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/grauds',
            },
            {
              label: 'Java Workspace',
              href: 'https://github.com/grauds/clematis.desktop',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Clematis. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['groovy', 'java', 'asciidoc'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Clematis Explained',
  tagline: 'Clematis Documentation, Recipes and Blog',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://github.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/grauds/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'grauds', // Usually your GitHub org/user name.
  projectName: 'clematis.docs', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
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
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
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
              to: '/docs/clematis-explained/overview',
            },
            {
              label: 'Recipes Book',
              to: '/docs/recipes-book/react/props-and-state',
            },
          ],
        },
        {
          title: 'Projects',
          items: [
            {
              label: 'Money Tracker UI',
              href: 'https://github.com/grauds/money.tracker.ui',
            },
            {
              label: 'Money Tracker Backend',
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
              label: 'Cosmic Backend',
              href: 'https://github.com/grauds/clematis.cosmic',
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
              label: 'Clematis Auth API',
              href: 'https://github.com/grauds/clematis.auth.api',
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
      additionalLanguages: ['groovy', 'java'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

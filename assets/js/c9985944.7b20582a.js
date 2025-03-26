"use strict";(self.webpackChunkclematis_doc=self.webpackChunkclematis_doc||[]).push([[3318],{43507:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>c,contentTitle:()=>s,default:()=>g,frontMatter:()=>a,metadata:()=>r,toc:()=>p});const r=JSON.parse('{"id":"web-applications/serving-data/serving-data","title":"Serving Data","description":"Server-side data access is covered by Spring and configured by Spring Boot in a few quite simple","source":"@site/docs/web-applications/serving-data/serving-data.md","sourceDirName":"web-applications/serving-data","slug":"/web-applications/serving-data/","permalink":"/clematis.doc/docs/web-applications/serving-data/","draft":false,"unlisted":false,"tags":[{"inline":true,"label":"spring-data-rest","permalink":"/clematis.doc/docs/tags/spring-data-rest"},{"inline":true,"label":"spring-web","permalink":"/clematis.doc/docs/tags/spring-web"},{"inline":true,"label":"domain-driven-design","permalink":"/clematis.doc/docs/tags/domain-driven-design"},{"inline":true,"label":"dao","permalink":"/clematis.doc/docs/tags/dao"},{"inline":true,"label":"spring-jpa","permalink":"/clematis.doc/docs/tags/spring-jpa"},{"inline":true,"label":"cors","permalink":"/clematis.doc/docs/tags/cors"}],"version":"current","sidebarPosition":14,"frontMatter":{"sidebar_position":14,"tags":["spring-data-rest","spring-web","domain-driven-design","dao","spring-jpa","cors"]},"sidebar":"tutorialSidebar","previous":{"title":"Database Initialization","permalink":"/clematis.doc/docs/web-applications/database-initialization"},"next":{"title":"Data Transfer Objects","permalink":"/clematis.doc/docs/web-applications/serving-data/data-transfer-objects"}}');var t=i(74848),o=i(28453);const a={sidebar_position:14,tags:["spring-data-rest","spring-web","domain-driven-design","dao","spring-jpa","cors"]},s="Serving Data",c={},p=[{value:"Spring Configuration",id:"spring-configuration",level:2},{value:"Configuring CORS",id:"configuring-cors",level:2},{value:"CORS for Spring Web",id:"cors-for-spring-web",level:3},{value:"CORS for Spring Data REST",id:"cors-for-spring-data-rest",level:3}];function d(e){const n={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",p:"p",pre:"pre",...(0,o.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.header,{children:(0,t.jsx)(n.h1,{id:"serving-data",children:"Serving Data"})}),"\n",(0,t.jsxs)(n.p,{children:["Server-side data access is covered by Spring and configured by Spring Boot in a few quite simple\nsteps. Spring Data uses ",(0,t.jsx)(n.a,{href:"https://docs.spring.io/spring-data/relational/reference/jdbc/domain-driven-design.html",children:"repository abstraction"}),"\nto implement Domain Driven Design approach and to\nminimize the boilerplate code required for Data Access Objects layer."]}),"\n",(0,t.jsxs)(n.p,{children:["More documentation on this is available at ",(0,t.jsx)(n.a,{href:"https://docs.spring.io/spring-data/relational/reference/repositories/introduction.html",children:"official Spring Data\nresource"}),"."]}),"\n",(0,t.jsx)(n.h2,{id:"spring-configuration",children:"Spring Configuration"}),"\n",(0,t.jsx)(n.p,{children:"The configuration for Spring Data is as follows:"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-gradle",metastring:'title="build.gradle"',children:"dependencies {\n   implementation 'org.springframework.boot:spring-boot-starter-data-jpa'\n   implementation 'org.springframework.boot:spring-boot-starter-data-rest'\n   implementation 'org.springframework.boot:spring-boot-starter-web'\n}\n\n"})}),"\n",(0,t.jsxs)(n.p,{children:["Namely, there are two parts of a larger Spring Data family are configured above,\nthey are ",(0,t.jsx)(n.a,{href:"https://spring.io/projects/spring-data-jpa",children:"Spring Data JPA"})," and\n",(0,t.jsx)(n.a,{href:"https://spring.io/projects/spring-data-rest",children:"Spring Data REST"}),". Also, the\nthird starter is responsible for ",(0,t.jsx)(n.a,{href:"https://docs.spring.io/spring-boot/reference/web/servlet.html",children:"Spring Web Application"}),"\nwith embedded servlet container and additional REST capabilities. The latter is used for\nthe cases then business domain logic with several repositories has to be implemented."]}),"\n",(0,t.jsx)(n.h2,{id:"configuring-cors",children:"Configuring CORS"}),"\n",(0,t.jsxs)(n.p,{children:["Since there are two Spring Web technologies are utilized,\n",(0,t.jsx)(n.a,{href:"https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS",children:"Cross-Origin Resource Sharing (CORS)"}),"\nshould be configured twice."]}),"\n",(0,t.jsx)(n.h3,{id:"cors-for-spring-web",children:"CORS for Spring Web"}),"\n",(0,t.jsx)(n.p,{children:"This configuration is done with a configuration bean, like below:"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-java",metastring:'title="src/main/java/org/clematis/*/config/SpringWebCorsConfig.java"',children:'import org.springframework.context.annotation.Bean;\nimport org.springframework.context.annotation.Configuration;\nimport org.springframework.http.HttpMethod;\nimport org.springframework.web.cors.CorsConfiguration;\nimport org.springframework.web.cors.CorsConfigurationSource;\nimport org.springframework.web.cors.UrlBasedCorsConfigurationSource;\n\n@Configuration\npublic class SpringWebCorsConfig {\n\n    public static final String ALL_REGEXP = "/**";\n    public static final String ORIGINS = "*";\n\n    @Bean(name = "corsConfigurationSource")\n    public CorsConfigurationSource corsConfigurationSource() {\n\n        CorsConfiguration configuration = new CorsConfiguration();\n        configuration.setAllowedOrigins(List.of(ORIGINS));\n        configuration.setAllowedMethods(List.of(HttpMethod.GET.name(),\n                HttpMethod.POST.name(),\n                HttpMethod.PUT.name(),\n                HttpMethod.PATCH.name(),\n                HttpMethod.DELETE.name(),\n                HttpMethod.OPTIONS.name(),\n                HttpMethod.HEAD.name()));\n\n        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();\n        source.registerCorsConfiguration(ALL_REGEXP, configuration);\n        return source;\n    }\n}\n'})}),"\n",(0,t.jsx)(n.h3,{id:"cors-for-spring-data-rest",children:"CORS for Spring Data REST"}),"\n",(0,t.jsx)(n.p,{children:"Another configuration works with Spring Data REST endpoints:"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-java",metastring:'title="src/main/java/org/clematis/*/config/SpringDataRestCorsConfig.java"',children:'package org.clematis.cosmic.config;\n\nimport org.clematis.cosmic.model.InputData;\nimport org.clematis.cosmic.model.Project;\nimport org.springframework.data.rest.core.config.RepositoryRestConfiguration;\nimport org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;\nimport org.springframework.http.HttpMethod;\nimport org.springframework.stereotype.Component;\nimport org.springframework.web.servlet.config.annotation.CorsRegistry;\n\n@Component\npublic class SpringDataRestCorsConfig implements RepositoryRestConfigurer {\n\n    public static final String ALL_REGEXP = "/**";\n    public static final String ORIGINS = "*";\n\n    @SuppressWarnings("checkstyle:MagicNumber")\n    @Override\n    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {\n\n        cors.addMapping(ALL_REGEXP)\n            .allowedOrigins(ORIGINS)\n            .allowedMethods(HttpMethod.GET.name(),\n                HttpMethod.POST.name(),\n                HttpMethod.PUT.name(),\n                HttpMethod.PATCH.name(),\n                HttpMethod.DELETE.name(),\n                HttpMethod.OPTIONS.name(),\n                HttpMethod.HEAD.name())\n            .allowCredentials(false)\n            .maxAge(3600);\n\n        config.exposeIdsFor(Project.class);\n        config.exposeIdsFor(InputData.class);\n    }\n}\n'})})]})}function g(e={}){const{wrapper:n}={...(0,o.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(d,{...e})}):d(e)}},28453:(e,n,i)=>{i.d(n,{R:()=>a,x:()=>s});var r=i(96540);const t={},o=r.createContext(t);function a(e){const n=r.useContext(o);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function s(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:a(e.components),r.createElement(o.Provider,{value:n},e.children)}}}]);
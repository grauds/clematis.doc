import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  img: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Home Budget',
    img: require('@site/static/img/mt.png').default,
    description: (
      <>
        <a href={'https://www.dominsoft.ru'}>Money Tracker </a>
        and Clematis Money Tracker reporting application work together to
          better plan and control home budgets and money flow.
      </>
    ),
  },
  {
    title: 'Time Budget',
    img: require('@site/static/img/pomodoro.png').default,
    description: (
      <>
        A well-known <a href={'https://en.wikipedia.org/wiki/Pomodoro_Technique'}>
          time management technique </a> invented by Francesco Cirillo takes care of
          time budgets in daily tasks in Pomodoro application.
      </>
    ),
  },
  {
    title: 'Applied Science and React',
    img: require('@site/static/img/cosmic.png').default,
    description: (
      <>
        Migrate scientific calculations in Fortran from command line to
        web where they can be done with grace in Clematis Cosmic.
      </>
    ),
  },
];

function Feature({title, img, description}: Readonly<FeatureItem>) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img className={styles.featureSvg} src={img} alt={''}/>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

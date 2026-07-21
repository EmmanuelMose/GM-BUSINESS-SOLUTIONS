import Layout from '../components/layout/Layout';
import Hero from '../components/home/Hero';
import Highlights from '../components/home/Highlights';
import Categories from '../components/home/Categories';
import Products from '../components/home/Products';

export default function HomePage() {
  return (
    <Layout>
      <Hero />
      <Highlights />
      <Categories />
      <Products />
    </Layout>
  );
}
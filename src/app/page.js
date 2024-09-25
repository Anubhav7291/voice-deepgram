import Head from 'next/head';
import { Container } from '@mui/material';
import VoiceRecognition from './components/VoiceRecognition';

export default function Home() {
  return (
    <Container>
      <Head>
        <title>Voice to Text App</title>
      </Head>
      <VoiceRecognition />
    </Container>
  );
}

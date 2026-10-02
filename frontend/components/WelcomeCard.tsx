type WelcomeCardProps = {
  nama: string;
};

export default function WelcomeCard({ nama }: WelcomeCardProps) {
  return (
    <div>
      <h2>Selamat Datang, {nama}!</h2>
      <p>Selamat datang di LMS SMP 2 Temanggung</p>
    </div>
  );
}
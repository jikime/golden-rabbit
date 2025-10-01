export default function Home() {
  const user = { email: "guest@example.com", name: "게스트" };
  const userName = user.name; 

  return (
    <main>
      <h1>안녕하세요, {userName}님!</h1>
    </main>
  );
}

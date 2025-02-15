import Image from 'next/image'

export default function Header() {
  return (
    <div className="flex flex-col gap-16 items-center">
      <h1 className="text-3xl lg:text-4xl font-bold text-center">Welcome to Formzilla</h1>
      <div className="flex justify-center items-center">
        <Image
          src="/Overworked-Employee-3--Streamline-Milano.png"
          alt="Overworked Employee"
          width={200}  // adjust these values based on your needs
          height={200} // adjust these values based on your needs
          className="mb-4"  // adds some margin at the bottom
        />
      </div>
      <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
        We make paperwork go poof✨{" "}
      </p>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}

import { JSX } from "preact";
import SearchIcon from "@/components/searchIcon.tsx";
import { useRef } from "preact/hooks";

interface SearchBarProps
  extends JSX.IntrinsicAttributes,
    JSX.HTMLAttributes<HTMLInputElement> {
  onInputChange: (value: string) => void;
}

export default function SearchBar(props: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    props.onInputChange(value);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      //|| e.key === "Enter"
      // Remove focus from the input element
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };
  return (
    <>
      <label class="relative block">
        {/* <span class="sr-only">Search</span> */}
        <span class="absolute inset-y-0 left-0 flex items-center pl-2">
          <SearchIcon />

          <svg class="h-5 w-5 fill-slate-300" viewBox="0 0 20 20"></svg>
        </span>
        <input
          {...props}
          class="text-black placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
          placeholder="Search for a staff member..."
          type="text"
          name="search"
          onInput={handleInputChange}
          onKeyDown={handleKeyPress} //if you want to exit the focus after the keypress
          ref={inputRef}
        />
      </label>
    </>
  );
}

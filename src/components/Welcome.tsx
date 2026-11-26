import closedWall from "../assets/background-closed.png";

type Props = {
  onBegin: () => void;
};

export default function Welcome({ onBegin }: Props) {
  return (
    <div className="stage welcome" style={{ backgroundImage: `url(${closedWall})` }}>
      <div className="welcome-panel">
        <h1 className="welcome-title">Taskies</h1>
        <p className="welcome-copy">Let's name your first Taskie</p>
        <button type="button" className="welcome-begin" onClick={onBegin}>
          Begin
        </button>
      </div>
    </div>
  );
}

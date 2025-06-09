
import PropTypes from 'prop-types';

const LessonCard = ({
  title,
  description = '',
  onClick = () => {},
}) => (
  <div
    onClick={onClick}
    className="cursor-pointer bg-white rounded-lg shadow-md hover:shadow-xl transition p-6 flex flex-col justify-between"
  >
    <h3 className="text-xl font-semibold text-green-800 mb-2">{title}</h3>
    <p className="text-green-700 flex-grow">{description}</p>
    <button className="mt-4 self-start px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
      Start
    </button>
  </div>
);

LessonCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  onClick: PropTypes.func,
};

export default LessonCard;

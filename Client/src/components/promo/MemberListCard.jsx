import { UserCircle2 } from "lucide-react";

const members = [
  {
    name: "Rahul Sharma",
    level: "Level 1",
    earning: "₹120",
  },
  {
    name: "Aman Khan",
    level: "Level 2",
    earning: "₹90",
  },
  {
    name: "Rohit Singh",
    level: "Level 3",
    earning: "₹45",
  },
  {
    name: "Mohit Kumar",
    level: "Level 1",
    earning: "₹250",
  },
];

const MemberListCard = () => {
  return (
    <div className="bg-white rounded-3xl shadow border border-gray-100 p-5">

      <h3 className="text-lg font-bold text-gray-800 mb-5">
        Recent Members
      </h3>

      <div className="space-y-4">

        {members.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <UserCircle2
                  size={26}
                  className="text-yellow-600"
                />
              </div>

              <div>
                <h4 className="font-semibold text-gray-800">
                  {item.name}
                </h4>

                <p className="text-xs text-gray-500">
                  {item.level}
                </p>
              </div>

            </div>

            <span className="font-bold text-green-600">
              {item.earning}
            </span>

          </div>
        ))}

      </div>

    </div>
  );
};

export default MemberListCard;
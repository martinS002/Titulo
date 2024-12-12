import FormTask from "../components/FormTask"
import ListTask from "../components/ListTask"

export const revalidate = 0;


function Inventario(){
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 flex">
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex-1 flex flex-col lg:flex-row">
              <div className="lg:w-1/3 p-4">
                <FormTask />
              </div>
              <div className="lg:w-2/3 p-4">
                <ListTask />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
export default Inventario